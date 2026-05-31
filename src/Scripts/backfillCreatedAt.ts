import mongoose, { connect, Model } from "mongoose";
import "dotenv/config";
import dns from "dns";

// Match the app's DB setup: the local resolver may refuse Atlas SRV lookups.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import ColorModel from "../Model/Color/ColorModel";
import CategoryModel from "../Model/Category/CategoryModel";
import SubCategoryModel from "../Model/SubCategory/SubCategoryModel";
import ImageSliderModel from "../Model/ImageSlider/ImageSliderModel";
import ShippingModel from "../Model/Shipping/ShippingModel";
import GroupSizeModel from "../Model/GroupSize/GroupSize";
import SizeCategoryModel from "../Model/SizeCategory/SizeCategoryModel";
import SocialReviewModel from "../Model/SocialReview/SocialReviewModel";
import OfferModel from "../Model/Offers/Offers";

/**
 * One-time backfill: fill `createdAt`/`updatedAt` for documents that were
 * created before `timestamps: true` was added to their schemas.
 *
 * The value is derived from the document's own `_id` (an ObjectId already
 * embeds its creation time), so the historical ordering stays accurate.
 *
 * Safe to re-run: only documents that are still missing `createdAt` are touched.
 *
 * Run with:  npx ts-node src/Scripts/backfillCreatedAt.ts
 */
const modelsToBackfill: Model<any>[] = [
  ColorModel,
  CategoryModel,
  SubCategoryModel,
  ImageSliderModel,
  ShippingModel,
  GroupSizeModel,
  SizeCategoryModel,
  SocialReviewModel,
  OfferModel,
];

const backfillModel = async (model: Model<any>) => {
  // Use the native collection so we bypass schema casting and Mongoose's
  // automatic timestamp handling, and set the value straight from the _id.
  const result = await model.collection.updateMany(
    { createdAt: { $exists: false } },
    [
      {
        $set: {
          createdAt: { $toDate: "$_id" },
          updatedAt: { $toDate: "$_id" },
        },
      },
    ]
  );
  console.log(
    `  ${model.modelName.padEnd(16)} matched: ${result.matchedCount}, updated: ${result.modifiedCount}`
  );
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
    console.log("DB Connected. Starting createdAt backfill...\n");

    for (const model of modelsToBackfill) {
      await backfillModel(model);
    }

    console.log("\nBackfill complete.");
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
};

run();
