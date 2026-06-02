import mongoose, { connect } from "mongoose";
import "dotenv/config";
import dns from "dns";

// Match the app's DB setup: the local resolver may refuse Atlas SRV lookups.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import GroupSizeModel from "../Model/GroupSize/GroupSize";
import SizeCategoryModel from "../Model/SizeCategory/SizeCategoryModel";

/**
 * One-time seed: add a fixed, ordered list of sizes to a single group.
 *
 * `order` follows the order of the array below (1-based), so the
 * `/group-size/all-size` and `/all-sizes-by-group/:groupId` endpoints
 * (both sorted by `order: 1`) return them exactly as listed.
 *
 * Safe to re-run: each size is upserted on `{ groupSize, size }`, so an
 * existing size just has its `order` refreshed instead of being duplicated.
 *
 * Run with:  npx ts-node src/Scripts/seedSizeCategories.ts
 */
const GROUP_ID = "6a1f03000a9c77dde283a9d3";

const SIZES: string[] = [
  "36", "38", "40", "42", "44", "46", "48", "50", "52", "54",
  "36A", "38A", "40A", "42A", "44A",
  "36B", "38B", "40B", "42B", "44B",
  "36C", "38C", "40C", "42C", "44C",
  "44D", "46D", "48D", "50D",
  "46DD", "48DD", "50DD", "52DD", "54DD", "56DD",
  "One Size",
];

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

    const group = await GroupSizeModel.findById(GROUP_ID).select("name");
    if (!group) {
      console.error(`Group ${GROUP_ID} not found. Aborting.`);
      process.exitCode = 1;
      return;
    }
    console.log(`Seeding ${SIZES.length} sizes into group "${group.name}" (${GROUP_ID})...\n`);

    const ops = SIZES.map((size, index) => ({
      updateOne: {
        filter: { groupSize: GROUP_ID, size },
        update: { $set: { order: index + 1 } },
        upsert: true,
      },
    }));

    const result = await SizeCategoryModel.bulkWrite(ops, { ordered: true });
    console.log(
      `Done. inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}, matched: ${result.matchedCount}`
    );
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
};

run();
