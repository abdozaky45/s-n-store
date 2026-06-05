import mongoose, { connect } from "mongoose";
import "dotenv/config";
import dns from "dns";
import fs from "fs";
import path from "path";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

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
 * DANGEROUS — deletes S3 objects. Reads every image key referenced anywhere in
 * the database, lists every object in the bucket, and removes the objects that
 * no DB document references (orphans).
 *
 * Safety layers:
 *   1. Dry-run by default. Nothing is deleted unless you pass `--delete`.
 *   2. Aborts if the DB yields zero referenced keys (guards against a bad
 *      connection making every object look orphaned).
 *   3. Objects newer than --min-age-hours (default 24) are protected, so a
 *      freshly uploaded image whose DB record is still in flight is never hit.
 *   4. Reads via the native driver (no query middleware), so soft-deleted
 *      documents still count as "using" their images.
 *   5. Writes the orphan list to a file before deleting anything.
 *
 * Usage:
 *   npx ts-node src/Scripts/cleanupOrphanS3Images.ts                 # dry-run
 *   npx ts-node src/Scripts/cleanupOrphanS3Images.ts --min-age-hours=48
 *   npx ts-node src/Scripts/cleanupOrphanS3Images.ts --prefix=Product/
 *   npx ts-node src/Scripts/cleanupOrphanS3Images.ts --delete        # actually delete
 */

// ---- args -----------------------------------------------------------------
const args = process.argv.slice(2);
const hasFlag = (name: string) => args.includes(name);
const getOpt = (name: string, fallback: string) => {
  const hit = args.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.split("=")[1] : fallback;
};

const DO_DELETE = hasFlag("--delete");
const MIN_AGE_HOURS = Number(getOpt("--min-age-hours", "24"));
const PREFIX = getOpt("--prefix", ""); // empty = whole bucket

const S3_BATCH = 1000; // max keys per ListObjectsV2 page / DeleteObjects call

// ---- helpers --------------------------------------------------------------
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/** Collect every image key the database currently references. */
const collectUsedKeys = async (): Promise<Set<string>> => {
  const used = new Set<string>();
  const add = (id: unknown) => {
    if (typeof id === "string") {
      const k = id.trim();
      if (k && k !== "Invalid image url") used.add(k);
    }
  };

  // Native driver (.collection) bypasses any query middleware so soft-deleted
  // docs are included — their images are still referenced and must be kept.
  const products = await ProductModel.collection
    .find({}, { projection: { "defaultImage.mediaId": 1, "sizeChartImage.mediaId": 1, "albumImages.mediaId": 1 } })
    .toArray();
  for (const p of products) {
    add(p.defaultImage?.mediaId);
    add(p.sizeChartImage?.mediaId);
    for (const img of p.albumImages ?? []) add(img?.mediaId);
  }

  const singleImageColls: { model: { collection: any }; label: string }[] = [
    { model: CategoryModel, label: "categories" },
    { model: SubCategoryModel, label: "subcategories" },
    { model: OfferModel, label: "offers" },
    { model: SocialReviewModel, label: "socialreviews" },
  ];
  for (const { model } of singleImageColls) {
    const docs = await model.collection
      .find({}, { projection: { "image.mediaId": 1 } })
      .toArray();
    for (const d of docs) add(d.image?.mediaId);
  }

  const sliders = await ImageSliderModel.collection
    .find({}, { projection: { "images.image1.mediaId": 1, "images.image2.mediaId": 1 } })
    .toArray();
  for (const s of sliders) {
    add(s.images?.image1?.mediaId);
    add(s.images?.image2?.mediaId);
  }

  const orders = await OrderModel.collection
    .find({}, { projection: { "payment.transactions.receiptImage.mediaId": 1 } })
    .toArray();
  for (const o of orders) {
    for (const t of o.payment?.transactions ?? []) add(t?.receiptImage?.mediaId);
  }

  return used;
};

/** List every object in the bucket (paginated). */
const listAllObjects = async (bucket: string) => {
  const objects: { Key: string; LastModified?: Date }[] = [];
  let ContinuationToken: string | undefined;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: PREFIX || undefined,
        ContinuationToken,
        MaxKeys: S3_BATCH,
      })
    );
    for (const o of res.Contents ?? []) {
      if (o.Key) objects.push({ Key: o.Key, LastModified: o.LastModified });
    }
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return objects;
};

const chunk = <T>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

// ---- main -----------------------------------------------------------------
const run = async () => {
  const dbUrl = process.env.DB_URL;
  const bucket = process.env.AWS_BUCKET_NAME;
  if (!dbUrl) return fail("DB_URL is not set in the environment.");
  if (!bucket) return fail("AWS_BUCKET_NAME is not set in the environment.");
  if (!Number.isFinite(MIN_AGE_HOURS) || MIN_AGE_HOURS < 0)
    return fail("--min-age-hours must be a non-negative number.");

  try {
    mongoose.set("strictQuery", false);
    await connect(dbUrl, { serverSelectionTimeoutMS: 5000 });
    console.log(`DB Connected. Mode: ${DO_DELETE ? "DELETE" : "DRY-RUN"}`);
    console.log(`Bucket: ${bucket}${PREFIX ? `  prefix: ${PREFIX}` : ""}`);
    console.log(`Protecting objects younger than ${MIN_AGE_HOURS}h\n`);

    // 1) DB references
    const usedKeys = await collectUsedKeys();
    console.log(`Referenced keys in DB: ${usedKeys.size}`);

    // SAFETY: an empty used-set almost always means a broken read, not a truly
    // empty store. Refuse to treat the entire bucket as orphaned.
    if (usedKeys.size === 0) {
      return fail(
        "DB returned 0 referenced image keys — aborting to avoid wiping the bucket."
      );
    }

    // 2) S3 objects
    const objects = await listAllObjects(bucket);
    console.log(`Objects in bucket: ${objects.length}`);

    // 3) Classify
    const cutoff = Date.now() - MIN_AGE_HOURS * 3600 * 1000;
    const orphans: string[] = [];
    let protectedByAge = 0;
    for (const obj of objects) {
      if (usedKeys.has(obj.Key)) continue;
      const ts = obj.LastModified ? obj.LastModified.getTime() : 0;
      if (ts > cutoff) {
        protectedByAge++;
        continue;
      }
      orphans.push(obj.Key);
    }

    console.log(`Protected (too new): ${protectedByAge}`);
    console.log(`Orphans to delete:   ${orphans.length}\n`);

    if (orphans.length === 0) {
      console.log("Nothing to delete. ✅");
      return;
    }

    // 4) Always write the orphan list to disk before touching anything.
    const reportPath = path.join(
      process.cwd(),
      `orphan-s3-keys-${Date.now()}.txt`
    );
    fs.writeFileSync(reportPath, orphans.join("\n"), "utf8");
    console.log(`Orphan list written to: ${reportPath}`);
    console.log("Sample:");
    for (const k of orphans.slice(0, 20)) console.log(`  ${k}`);
    if (orphans.length > 20) console.log(`  ... and ${orphans.length - 20} more`);

    if (!DO_DELETE) {
      console.log("\nDRY-RUN — no objects deleted. Re-run with --delete to remove them.");
      return;
    }

    // 5) Delete in batches.
    let deleted = 0;
    for (const batch of chunk(orphans, S3_BATCH)) {
      const res = await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        })
      );
      deleted += batch.length - (res.Errors?.length ?? 0);
      if (res.Errors?.length) {
        console.error(`  ${res.Errors.length} delete errors in this batch:`);
        for (const e of res.Errors.slice(0, 5)) console.error(`    ${e.Key}: ${e.Message}`);
      }
    }
    console.log(`\nDeleted ${deleted}/${orphans.length} orphan objects. ✅`);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
};

function fail(msg: string) {
  console.error(msg + " Aborting.");
  process.exit(1);
}

run();
