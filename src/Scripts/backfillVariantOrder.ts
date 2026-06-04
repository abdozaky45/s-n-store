import mongoose, { connect } from "mongoose";
import "dotenv/config";
import dns from "dns";

// Match the app's DB setup: the local resolver may refuse Atlas SRV lookups.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import ProductModel from "../Model/Product/ProductModel";
import VariantModel from "../Model/Variant/VariantModel";
import CategoryModel from "../Model/Category/CategoryModel";
import SubCategoryModel from "../Model/SubCategory/SubCategoryModel";
import SizeCategoryModel from "../Model/SizeCategory/SizeCategoryModel";

/**
 * One-time backfill: fill `order` on every existing Variant so products render
 * their sizes in the configured order (S, M, L, XL …) instead of insertion /
 * natural order.
 *
 * The order is taken from SizeCategory.order, matched by the product's group
 * (subCategory.groupSize if present, else category.groupSize) + the variant size.
 * Sizes not found in the group fall back to 9999 (sorted last).
 *
 * This ONLY writes the `order` field on variants — no other data is touched.
 * Safe to re-run (it just recomputes `order`).
 *
 * Run with:  npx ts-node src/Scripts/backfillVariantOrder.ts
 */
const UNKNOWN_SIZE_ORDER = 9999;
const BATCH_SIZE = 1000;

const run = async () => {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.error("DB_URL is not set in the environment. Aborting.");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", false);
    await connect(dbUrl, { serverSelectionTimeoutMS: 5000 });
    console.log("DB Connected. Starting variant order backfill...\n");

    // 1) Group lookups: category/subCategory -> groupSize.
    const [categories, subCategories, sizeCategories] = await Promise.all([
      CategoryModel.find().select("groupSize").lean(),
      SubCategoryModel.find().select("groupSize").lean(),
      SizeCategoryModel.find().select("groupSize size order").lean(),
    ]);

    const catGroup = new Map<string, string>();
    for (const c of categories as any[]) {
      if (c.groupSize) catGroup.set(c._id.toString(), c.groupSize.toString());
    }
    const subGroup = new Map<string, string>();
    for (const s of subCategories as any[]) {
      if (s.groupSize) subGroup.set(s._id.toString(), s.groupSize.toString());
    }

    // 2) (groupSize|size) -> order.
    const sizeOrder = new Map<string, number>();
    for (const sc of sizeCategories as any[]) {
      sizeOrder.set(`${sc.groupSize.toString()}|${sc.size}`, sc.order);
    }

    // 3) product -> groupSize (subCategory group is more specific).
    const products = await ProductModel.find().select("category subCategory").lean();
    const productGroup = new Map<string, string | null>();
    for (const p of products as any[]) {
      const group =
        (p.subCategory && subGroup.get(p.subCategory.toString())) ||
        (p.category && catGroup.get(p.category.toString())) ||
        null;
      productGroup.set(p._id.toString(), group);
    }

    // 4) Walk variants and bulk-update their order in batches.
    const variants = await VariantModel.find().select("product size").lean();
    console.log(`  products: ${products.length}, variants: ${variants.length}`);

    let updated = 0;
    let ops: any[] = [];
    const flush = async () => {
      if (!ops.length) return;
      const res = await VariantModel.bulkWrite(ops, { ordered: false });
      updated += res.modifiedCount ?? 0;
      ops = [];
    };

    for (const v of variants as any[]) {
      const group = productGroup.get(v.product?.toString());
      const order = group
        ? sizeOrder.get(`${group}|${v.size}`) ?? UNKNOWN_SIZE_ORDER
        : UNKNOWN_SIZE_ORDER;
      ops.push({ updateOne: { filter: { _id: v._id }, update: { $set: { order } } } });
      if (ops.length >= BATCH_SIZE) await flush();
    }
    await flush();

    console.log(`\nBackfill complete. Variants updated: ${updated}.`);
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
};

run();
