import mongoose, { connect } from "mongoose";
import "dotenv/config";
import dns from "dns";

// Match the app's DB setup: the local resolver may refuse Atlas SRV lookups.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import ProductModel from "../Model/Product/ProductModel";
import CategoryModel from "../Model/Category/CategoryModel";
import SubCategoryModel from "../Model/SubCategory/SubCategoryModel";
import OfferModel from "../Model/Offers/Offers";
import OrderModel from "../Model/Order/OrderModel";
import ImageSliderModel from "../Model/ImageSlider/ImageSliderModel";
import SocialReviewModel from "../Model/SocialReview/SocialReviewModel";

/**
 * Repair `mediaId` values that were stored wrong while the CDN was live but the
 * old `extractMediaId` (which keyed off "amazonaws.com/") was still deployed —
 * those records got mediaId = "Invalid image url" instead of the real S3 key.
 *
 * The fix is derived purely from the stored `mediaUrl`: mediaId = the URL path
 * after the host (identical key on S3 or CloudFront). Records whose mediaId
 * already matches are skipped, so this is idempotent and safe to re-run, and it
 * leaves the 139 correctly-keyed legacy records untouched.
 *
 * Must run BEFORE cleanupOrphanS3Images — that script keys off mediaId, so a bad
 * mediaId would make a live image look like an orphan and get deleted.
 *
 * Usage:
 *   npx ts-node src/Scripts/repairMediaIds.ts            # dry-run (no writes)
 *   npx ts-node src/Scripts/repairMediaIds.ts --apply    # commit fixes
 */

const APPLY = process.argv.includes("--apply");
const BATCH_SIZE = 500;

/** mediaId = the object key = URL path after the host (S3 or CloudFront). */
function keyFromUrl(url: unknown): string | null {
  if (typeof url !== "string" || !url) return null;
  const m = url.match(/^https?:\/\/[^/]+\/(.+)$/);
  return m ? m[1].split("?")[0] : null;
}

function getPath(doc: any, path: string): any {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), doc);
}

type Slot =
  | { kind: "scalar"; urlPath: string; idPath: string }
  | { kind: "array"; arrayPath: string; urlSub: string; idSub: string };

interface CollSpec {
  model: { collection: any };
  label: string;
  slots: Slot[];
}

const COLLECTIONS: CollSpec[] = [
  {
    model: ProductModel,
    label: "products",
    slots: [
      { kind: "scalar", urlPath: "defaultImage.mediaUrl", idPath: "defaultImage.mediaId" },
      { kind: "scalar", urlPath: "sizeChartImage.mediaUrl", idPath: "sizeChartImage.mediaId" },
      { kind: "array", arrayPath: "albumImages", urlSub: "mediaUrl", idSub: "mediaId" },
    ],
  },
  { model: CategoryModel, label: "categories", slots: [{ kind: "scalar", urlPath: "image.mediaUrl", idPath: "image.mediaId" }] },
  { model: SubCategoryModel, label: "subcategories", slots: [{ kind: "scalar", urlPath: "image.mediaUrl", idPath: "image.mediaId" }] },
  { model: OfferModel, label: "offers", slots: [{ kind: "scalar", urlPath: "image.mediaUrl", idPath: "image.mediaId" }] },
  { model: SocialReviewModel, label: "socialreviews", slots: [{ kind: "scalar", urlPath: "image.mediaUrl", idPath: "image.mediaId" }] },
  {
    model: ImageSliderModel,
    label: "imagesliders",
    slots: [
      { kind: "scalar", urlPath: "images.image1.mediaUrl", idPath: "images.image1.mediaId" },
      { kind: "scalar", urlPath: "images.image2.mediaUrl", idPath: "images.image2.mediaId" },
    ],
  },
  {
    model: OrderModel,
    label: "orders",
    slots: [{ kind: "array", arrayPath: "payment.transactions", urlSub: "receiptImage.mediaUrl", idSub: "receiptImage.mediaId" }],
  },
];

function projectionFor(spec: CollSpec): Record<string, 1> {
  const proj: Record<string, 1> = {};
  for (const s of spec.slots) {
    if (s.kind === "scalar") {
      proj[s.urlPath] = 1; // siblings — no path collision
      proj[s.idPath] = 1;
    } else {
      proj[s.arrayPath] = 1; // whole array
    }
  }
  return proj;
}

const run = async () => {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.error("DB_URL is not set in the environment. Aborting.");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", false);
    await connect(dbUrl, { serverSelectionTimeoutMS: 5000 });
    console.log(`Mode: ${APPLY ? "APPLY (writing)" : "DRY-RUN (no writes)"}\n`);

    let grandFixable = 0;

    for (const spec of COLLECTIONS) {
      const docs = await spec.model.collection
        .find({}, { projection: projectionFor(spec) })
        .toArray();

      let fixable = 0;
      const samples: string[] = [];
      let ops: any[] = [];
      const flush = async () => {
        if (!ops.length || !APPLY) {
          ops = [];
          return;
        }
        await spec.model.collection.bulkWrite(ops, { ordered: false });
        ops = [];
      };

      for (const doc of docs) {
        const setOps: Record<string, string> = {};

        const consider = (url: unknown, storedId: unknown, idMongoPath: string) => {
          const correct = keyFromUrl(url);
          if (correct === null) return; // empty/invalid url slot — leave as is
          if (storedId === correct) return; // already correct → skip (idempotent)
          fixable++;
          if (samples.length < 10) samples.push(`${String(storedId)}  →  ${correct}`);
          setOps[idMongoPath] = correct;
        };

        for (const s of spec.slots) {
          if (s.kind === "scalar") {
            consider(getPath(doc, s.urlPath), getPath(doc, s.idPath), s.idPath);
          } else {
            const arr = getPath(doc, s.arrayPath);
            if (Array.isArray(arr)) {
              arr.forEach((el: any, i: number) => {
                const url = s.urlSub.split(".").reduce((o, k) => (o == null ? o : o[k]), el);
                const id = s.idSub.split(".").reduce((o, k) => (o == null ? o : o[k]), el);
                consider(url, id, `${s.arrayPath}.${i}.${s.idSub}`);
              });
            }
          }
        }

        if (Object.keys(setOps).length) {
          ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: setOps } } });
          if (ops.length >= BATCH_SIZE) await flush();
        }
      }
      await flush();

      grandFixable += fixable;
      console.log(`  ${spec.label.padEnd(15)} mediaIds to fix: ${fixable}`);
      for (const s of samples) console.log(`      ${s}`);
    }

    console.log(`\nTotal mediaIds to fix: ${grandFixable}`);
    if (!APPLY) {
      console.log("DRY-RUN — nothing written. Re-run with --apply to fix.");
    } else {
      console.log("APPLIED ✅");
    }
  } catch (error) {
    console.error("Repair failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("\nDB Disconnected.");
  }
};

run();
