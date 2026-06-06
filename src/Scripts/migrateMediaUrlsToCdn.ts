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
 * One-time (reversible) migration: rewrite the HOST of every stored `mediaUrl`
 * from the raw S3 origin to the CloudFront origin — WITHOUT touching `mediaId`
 * (the S3 object key) or any other field. The object path/key after the host is
 * preserved byte-for-byte, so the response shape and the image keys never change.
 *
 *   before:  https://my-bucket.s3.eu-central-1.amazonaws.com/Product/abc_123_0
 *   after:   https://d111111abcdef8.cloudfront.net/Product/abc_123_0
 *                                                  ^ only the host changes
 *
 * Run CloudFront FIRST. Running this before the distribution serves the bucket
 * will point every image at a host that 404s.
 *
 * Safety layers:
 *   1. Discovery mode (no args): prints every distinct URL origin found in the
 *      data + counts, so you copy the EXACT `--from` value. Nothing is written.
 *   2. Dry-run by default: with --from/--to but no --apply, it only previews
 *      how many docs change per collection + before/after samples.
 *   3. Exact-origin match: only URLs whose origin === --from are touched. URLs
 *      already on --to (or any other host) are skipped → safe to re-run (idempotent).
 *   4. Per-field $set on the precise path (incl. array indexes) — never rewrites
 *      a whole array, so sibling fields can't be clobbered.
 *   5. Native driver (.collection) bypasses query middleware, so soft-deleted
 *      docs are migrated too (their URLs must stay valid).
 *   6. Fully reversible: swap --from/--to to roll back.
 *
 * Usage:
 *   # 1) discover the exact origins present in the data
 *   npx ts-node src/Scripts/migrateMediaUrlsToCdn.ts
 *
 *   # 2) preview the rewrite (dry-run)
 *   npx ts-node src/Scripts/migrateMediaUrlsToCdn.ts \
 *     --from=https://my-bucket.s3.eu-central-1.amazonaws.com \
 *     --to=https://d111111abcdef8.cloudfront.net
 *
 *   # 3) apply it
 *   npx ts-node src/Scripts/migrateMediaUrlsToCdn.ts \
 *     --from=https://my-bucket.s3.eu-central-1.amazonaws.com \
 *     --to=https://d111111abcdef8.cloudfront.net --apply
 *
 *   # rollback: swap --from and --to, run with --apply
 */

// ---- args -----------------------------------------------------------------
const args = process.argv.slice(2);
const hasFlag = (name: string) => args.includes(name);
const getOpt = (name: string): string | undefined => {
  const hit = args.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : undefined;
};

const APPLY = hasFlag("--apply");
const FROM = stripTrailingSlash(getOpt("--from"));
const TO = stripTrailingSlash(getOpt("--to"));
const SAMPLE = Number(getOpt("--sample") ?? "10");
const BATCH_SIZE = 500;

function stripTrailingSlash(v?: string) {
  return v ? v.replace(/\/+$/, "") : v;
}

/** Split a URL into [origin, rest] where origin = scheme://host (no trailing /). */
function splitOrigin(url: string): [string, string] | null {
  const m = url.match(/^(https?:\/\/[^/]+)(\/.*)?$/i);
  if (!m) return null;
  return [m[1], m[2] ?? ""];
}

/**
 * Every place a mediaUrl lives. `paths` lists the dotted document paths that
 * hold a URL string; array fields are expanded per-index at runtime.
 */
type FieldSpec =
  | { kind: "scalar"; path: string } // e.g. "defaultImage.mediaUrl"
  | { kind: "array"; arrayPath: string; sub: string }; // e.g. albumImages[].mediaUrl

interface CollSpec {
  model: { collection: any };
  label: string;
  fields: FieldSpec[];
}

const COLLECTIONS: CollSpec[] = [
  {
    model: ProductModel,
    label: "products",
    fields: [
      { kind: "scalar", path: "defaultImage.mediaUrl" },
      { kind: "scalar", path: "sizeChartImage.mediaUrl" },
      { kind: "array", arrayPath: "albumImages", sub: "mediaUrl" },
    ],
  },
  { model: CategoryModel, label: "categories", fields: [{ kind: "scalar", path: "image.mediaUrl" }] },
  { model: SubCategoryModel, label: "subcategories", fields: [{ kind: "scalar", path: "image.mediaUrl" }] },
  { model: OfferModel, label: "offers", fields: [{ kind: "scalar", path: "image.mediaUrl" }] },
  { model: SocialReviewModel, label: "socialreviews", fields: [{ kind: "scalar", path: "image.mediaUrl" }] },
  {
    model: ImageSliderModel,
    label: "imagesliders",
    fields: [
      { kind: "scalar", path: "images.image1.mediaUrl" },
      { kind: "scalar", path: "images.image2.mediaUrl" },
    ],
  },
  {
    model: OrderModel,
    label: "orders",
    fields: [{ kind: "array", arrayPath: "payment.transactions", sub: "receiptImage.mediaUrl" }],
  },
];

/** Read a value at a dotted path. */
function getPath(doc: any, path: string): any {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), doc);
}

/** Build the Mongo projection that fetches only the URL-bearing fields. */
function projectionFor(spec: CollSpec): Record<string, 1> {
  const proj: Record<string, 1> = {};
  for (const f of spec.fields) {
    // Project the whole array (not array + sub-path — Mongo rejects that as a
    // path collision); the sub-field comes along inside each element.
    proj[f.kind === "scalar" ? f.path : f.arrayPath] = 1;
  }
  return proj;
}

// ---- main -----------------------------------------------------------------
const run = async () => {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) return fail("DB_URL is not set in the environment.");

  const DISCOVERY = !FROM && !TO;
  if (!DISCOVERY) {
    if (!FROM) return fail("--from is required (use discovery mode first to find it).");
    if (!TO) return fail("--to is required.");
    if (splitOrigin(FROM + "/x") === null) return fail(`--from is not a valid origin: ${FROM}`);
    if (splitOrigin(TO + "/x") === null) return fail(`--to is not a valid origin: ${TO}`);
    if (FROM === TO) return fail("--from and --to are identical; nothing to do.");
    if (/amazonaws\.com$/i.test(TO)) {
      console.warn(`⚠️  --to points back at S3 (${TO}). Assuming an intentional rollback.\n`);
    }
  }

  try {
    mongoose.set("strictQuery", false);
    await connect(dbUrl, { serverSelectionTimeoutMS: 5000 });

    if (DISCOVERY) {
      console.log("DISCOVERY mode — listing distinct mediaUrl origins. No writes.\n");
    } else {
      console.log(`Mode: ${APPLY ? "APPLY (writing)" : "DRY-RUN (no writes)"}`);
      console.log(`  from: ${FROM}`);
      console.log(`  to:   ${TO}\n`);
    }

    const originCounts = new Map<string, number>(); // discovery
    let grandTotalSeen = 0;
    let grandTotalChanged = 0;

    for (const spec of COLLECTIONS) {
      const cursor = spec.model.collection.find({}, { projection: projectionFor(spec) });
      const docs = await cursor.toArray();

      let seen = 0;
      let changed = 0;
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

        const handleUrl = (url: any, mongoPath: string) => {
          if (typeof url !== "string" || !url) return;
          const parts = splitOrigin(url);
          if (!parts) return;
          const [origin, rest] = parts;
          seen++;

          if (DISCOVERY) {
            originCounts.set(origin, (originCounts.get(origin) ?? 0) + 1);
            return;
          }
          if (origin !== FROM) return; // only the exact source origin
          const next = `${TO}${rest}`;
          if (next === url) return;
          changed++;
          if (samples.length < SAMPLE) samples.push(`${url}\n      → ${next}`);
          setOps[mongoPath] = next;
        };

        for (const f of spec.fields) {
          if (f.kind === "scalar") {
            handleUrl(getPath(doc, f.path), f.path);
          } else {
            const arr = getPath(doc, f.arrayPath);
            if (Array.isArray(arr)) {
              arr.forEach((el: any, i: number) => {
                const url = f.sub.split(".").reduce((o, k) => (o == null ? o : o[k]), el);
                handleUrl(url, `${f.arrayPath}.${i}.${f.sub}`);
              });
            }
          }
        }

        if (!DISCOVERY && Object.keys(setOps).length) {
          ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: setOps } } });
          if (ops.length >= BATCH_SIZE) await flush();
        }
      }
      await flush();

      if (!DISCOVERY) {
        grandTotalSeen += seen;
        grandTotalChanged += changed;
        console.log(`  ${spec.label.padEnd(15)} urls seen: ${seen}  to change: ${changed}`);
        for (const s of samples) console.log(`      ${s}`);
      }
    }

    if (DISCOVERY) {
      console.log("Distinct origins found across all collections:\n");
      const sorted = [...originCounts.entries()].sort((a, b) => b[1] - a[1]);
      for (const [origin, count] of sorted) {
        console.log(`  ${count.toString().padStart(7)}  ${origin}`);
      }
      console.log("\nCopy the S3 origin above into --from, set --to to your CloudFront origin.");
    } else {
      console.log(`\nTotal urls seen: ${grandTotalSeen}  to change: ${grandTotalChanged}`);
      if (!APPLY) {
        console.log("DRY-RUN — nothing was written. Re-run with --apply to commit.");
      } else {
        console.log("APPLIED ✅  (re-run is safe — already-migrated urls are skipped).");
      }
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("\nDB Disconnected.");
  }
};

function fail(msg: string) {
  console.error(msg + " Aborting.");
  process.exit(1);
}

run();
