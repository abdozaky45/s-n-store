import mongoose, { connect } from "mongoose";
import "dotenv/config";
import dns from "dns";
import fs from "fs";
import path from "path";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import ProductModel from "../Model/Product/ProductModel";
import CategoryModel from "../Model/Category/CategoryModel";
import SubCategoryModel from "../Model/SubCategory/SubCategoryModel";
import OfferModel from "../Model/Offers/Offers";
import OrderModel from "../Model/Order/OrderModel";
import ImageSliderModel from "../Model/ImageSlider/ImageSliderModel";
import SocialReviewModel from "../Model/SocialReview/SocialReviewModel";

/**
 * Independent verification before deleting orphan S3 keys.
 *
 * For each sampled key it queries EVERY image field in EVERY collection
 * directly (native driver, so soft-deleted docs count too) and reports where —
 * if anywhere — the key is referenced.
 *
 *   - Sampled orphans should come back "NOT referenced" everywhere.
 *   - A positive control (a key we know IS used) must come back referenced,
 *     proving the search itself works and "not found" is trustworthy.
 *
 * Run with:  npx ts-node src/Scripts/verifyOrphanS3Keys.ts
 *            npx ts-node src/Scripts/verifyOrphanS3Keys.ts <key1> <key2> ...
 */

/** Search every collection/field for an exact mediaId; return the matches. */
const findUsage = async (key: string): Promise<string[]> => {
  const hits: string[] = [];
  const tally = async (label: string, coll: any, filter: any) => {
    if (await coll.countDocuments(filter)) hits.push(label);
  };

  await tally("products", ProductModel.collection, {
    $or: [
      { "defaultImage.mediaId": key },
      { "sizeChartImage.mediaId": key },
      { "albumImages.mediaId": key },
    ],
  });
  await tally("categories", CategoryModel.collection, { "image.mediaId": key });
  await tally("subcategories", SubCategoryModel.collection, { "image.mediaId": key });
  await tally("offers", OfferModel.collection, { "image.mediaId": key });
  await tally("socialreviews", SocialReviewModel.collection, { "image.mediaId": key });
  await tally("imagesliders", ImageSliderModel.collection, {
    $or: [{ "images.image1.mediaId": key }, { "images.image2.mediaId": key }],
  });
  await tally("orders", OrderModel.collection, {
    "payment.transactions.receiptImage.mediaId": key,
  });

  return hits;
};

/** Pick keys to test: CLI args, else a sample from the newest orphan report. */
const pickSampleKeys = (): string[] => {
  const cliKeys = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (cliKeys.length) return cliKeys;

  const reports = fs
    .readdirSync(process.cwd())
    .filter((f) => f.startsWith("orphan-s3-keys-") && f.endsWith(".txt"))
    .sort();
  if (!reports.length) {
    console.error("No orphan-s3-keys-*.txt report found and no keys passed. Aborting.");
    process.exit(1);
  }
  const latest = reports[reports.length - 1];
  console.log(`Sampling from report: ${latest}`);
  const all = fs
    .readFileSync(path.join(process.cwd(), latest), "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Take up to 2 keys per prefix so every folder is represented.
  const perPrefix = new Map<string, string[]>();
  for (const k of all) {
    const prefix = k.split("/")[0];
    const arr = perPrefix.get(prefix) ?? [];
    if (arr.length < 2) arr.push(k);
    perPrefix.set(prefix, arr);
  }
  return [...perPrefix.values()].flat();
};

const run = async () => {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.error("DB_URL is not set in the environment. Aborting.");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", false);
    await connect(dbUrl, { serverSelectionTimeoutMS: 5000 });
    console.log("DB Connected.\n");

    // --- positive control: a key we KNOW is used --------------------------
    const sampleProduct = await ProductModel.collection.findOne(
      { "defaultImage.mediaId": { $exists: true, $ne: "" } },
      { projection: { "defaultImage.mediaId": 1 } }
    );
    const controlKey = sampleProduct?.defaultImage?.mediaId as string | undefined;
    if (controlKey) {
      const controlHits = await findUsage(controlKey);
      const ok = controlHits.includes("products");
      console.log(`Positive control: ${controlKey}`);
      console.log(`  found in: [${controlHits.join(", ")}]  ${ok ? "✅ search works" : "❌ SEARCH BROKEN — do NOT delete"}\n`);
      if (!ok) process.exit(1);
    } else {
      console.log("Positive control: no product image found to test with.\n");
    }

    // --- sampled orphans: expect NO hits ----------------------------------
    const keys = pickSampleKeys();
    console.log(`Checking ${keys.length} sampled orphan keys:\n`);
    let flagged = 0;
    for (const key of keys) {
      const hits = await findUsage(key);
      if (hits.length) {
        flagged++;
        console.log(`  ⚠️ REFERENCED  ${key}  -> [${hits.join(", ")}]`);
      } else {
        console.log(`  ✅ orphan      ${key}`);
      }
    }

    console.log(
      `\nResult: ${flagged === 0
        ? "all sampled keys are confirmed orphans. Safe to delete. ✅"
        : `${flagged} sampled key(s) ARE still referenced — DO NOT run --delete. ❌`}`
    );
  } catch (error) {
    console.error("Verification failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
};

run();
