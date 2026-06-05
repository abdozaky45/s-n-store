import mongoose, { connect } from "mongoose";
import "dotenv/config";
import dns from "dns";

// Match the app's DB setup: the local resolver may refuse Atlas SRV lookups.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import ProductModel from "../Model/Product/ProductModel";

/**
 * TEMPORARY test fixture: flags 20 products as bestSeller so the frontend can be
 * tested against /public/product/get-all-products?isBestSeller=true.
 *
 * It mimics a real admin action: isBestSeller = true AND bestSellerManual = true
 * (so the nightly agenda leaves them alone). Picks products that are NOT already
 * bestSeller and not deleted, and prints their IDs so they can be reverted.
 *
 * Run with:  npx ts-node src/Scripts/seedTestBestSellers.ts
 *
 * To revert these later, set isBestSeller=false, bestSellerManual=false on the
 * printed IDs (ask Claude for a revert script, or do it in the DB).
 */
const LIMIT = 20;

const run = async () => {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.error("DB_URL is not set in the environment. Aborting.");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", false);
    await connect(dbUrl, { serverSelectionTimeoutMS: 5000 });
    console.log("DB Connected. Seeding test bestSellers...\n");

    const candidates = await ProductModel.find({
      isDeleted: false,
      isBestSeller: { $ne: true },
    })
      .limit(LIMIT)
      .select("_id name");

    if (candidates.length === 0) {
      console.log("No eligible products found (all are already bestSeller?). Nothing changed.");
      return;
    }

    const ids = candidates.map((c) => c._id);
    const result = await ProductModel.updateMany(
      { _id: { $in: ids } },
      { $set: { isBestSeller: true, bestSellerManual: true } }
    );

    console.log(`Flagged ${result.modifiedCount} products as bestSeller (manual):\n`);
    for (const c of candidates) {
      const name = c.name?.en || c.name?.ar || "";
      console.log(`  ${c._id}  ${name}`);
    }
    console.log("\nDone. Test against: GET /public/product/get-all-products?isBestSeller=true");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
};

run();
