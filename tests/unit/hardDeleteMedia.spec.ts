import mongoose from "mongoose";

// Simulate S3 being unavailable: every object delete rejects. The best-effort
// post-commit cleanup must swallow this, and the DB delete must still stick.
jest.mock("../../src/Service/Aws/S3_Bucket/presignedUrl", () => ({
  __esModule: true,
  default: class {
    deletePresignedUrl = jest.fn().mockRejectedValue(new Error("S3 unavailable"));
  },
}));

import { connectTestReplSet, closeTestReplSet } from "../helpers/replset";
import { clearTestDB } from "../helpers/db";
import { hardDeleteProduct } from "../../src/Service/Product/ProductService";
import { hardDeleteCategory } from "../../src/Service/Category/CategoryService";
import ProductModel from "../../src/Model/Product/ProductModel";
import VariantModel from "../../src/Model/Variant/VariantModel";
import CategoryModel from "../../src/Model/Category/CategoryModel";
import SubCategoryModel from "../../src/Model/SubCategory/SubCategoryModel";

beforeAll(connectTestReplSet);
afterEach(clearTestDB);
afterAll(closeTestReplSet);

const seedProduct = (overrides: Record<string, unknown> = {}) =>
  ProductModel.create({
    name: { ar: "م", en: "p" },
    description: { ar: "و", en: "d" },
    price: 100,
    finalPrice: 100,
    category: new mongoose.Types.ObjectId(),
    createdBy: new mongoose.Types.ObjectId(),
    createdAt: Date.now(),
    defaultImage: { mediaUrl: "https://cdn.test/x", mediaId: "key-x" },
    ...overrides,
  });

describe("hard delete media cleanup (S3 failure must not roll back the DB delete)", () => {
  it("hardDeleteProduct removes the product + variants even when S3 deletion fails", async () => {
    const product = await seedProduct();
    await VariantModel.create({ product: product._id, size: "M", quantity: 5 });

    await expect(hardDeleteProduct(product._id.toString())).resolves.toBeUndefined();

    expect(await ProductModel.findById(product._id)).toBeNull();
    expect(await VariantModel.countDocuments({ product: product._id })).toBe(0);
  });

  it("hardDeleteCategory cascades (category + subs + products) even when S3 deletion fails", async () => {
    const groupSize = new mongoose.Types.ObjectId();
    const createdBy = new mongoose.Types.ObjectId();
    const category = await CategoryModel.create({
      name: { ar: "ت", en: "c" },
      groupSize,
      createdBy,
      image: { mediaUrl: "https://cdn.test/c", mediaId: "key-c" },
    });
    await SubCategoryModel.create({
      name: { ar: "ف", en: "s" },
      groupSize,
      category: category._id,
      createdBy,
      image: { mediaUrl: "https://cdn.test/s", mediaId: "key-s" },
    });
    const product = await seedProduct({ category: category._id });
    await VariantModel.create({ product: product._id, size: "M", quantity: 3 });

    await expect(hardDeleteCategory(category._id.toString())).resolves.toBeUndefined();

    expect(await CategoryModel.findById(category._id)).toBeNull();
    expect(await SubCategoryModel.countDocuments({ category: category._id })).toBe(0);
    expect(await ProductModel.countDocuments({ category: category._id })).toBe(0);
    expect(await VariantModel.countDocuments({ product: product._id })).toBe(0);
  });
});
