/**
 * Variant -> product-cache invalidation WIRING tests.
 *
 * A variant's size/color/quantity (and the derived isSoldOut flag) are embedded
 * in the cached home feeds and product listings. So every variant write MUST
 * bust the product caches, otherwise the storefront keeps serving a sold-out or
 * mis-priced product until the TTL expires — the exact "edit doesn't update the
 * cache" bug we're guarding against.
 *
 * We run the real services against an in-memory MongoDB but replace ONLY
 * invalidatePattern with a spy (CacheKeys stays real), then assert each variant
 * write path actually fires invalidatePattern("product*").
 */

// Mock the cache module: keep everything real except invalidatePattern, which
// becomes a spy so we can assert the services call it on every variant write.
jest.mock("../../src/Utils/Cache/cache", () => {
  const actual = jest.requireActual("../../src/Utils/Cache/cache");
  return {
    ...actual,
    invalidatePattern: jest.fn().mockResolvedValue(undefined),
  };
});

import mongoose from "mongoose";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db";
import { invalidatePattern, CacheKeys } from "../../src/Utils/Cache/cache";
import {
  createVariant,
  createManyVariants,
  updateVariantQuantity,
  updateManyVariants,
  deleteVariant,
  deleteManyVariants,
  updateProductSoldOutStatus,
} from "../../src/Service/Variant/VariantService";
import ProductModel from "../../src/Model/Product/ProductModel";
import VariantModel from "../../src/Model/Variant/VariantModel";

const bust = invalidatePattern as jest.MockedFunction<typeof invalidatePattern>;

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

const seedProduct = () =>
  ProductModel.create({
    name: { ar: "منتج", en: "product" },
    description: { ar: "وصف", en: "desc" },
    price: 100,
    finalPrice: 100,
    category: new mongoose.Types.ObjectId(),
    createdBy: new mongoose.Types.ObjectId(),
    createdAt: Date.now(),
  });

const seedVariant = (productId: mongoose.Types.ObjectId, overrides = {}) =>
  VariantModel.create({
    product: productId,
    size: "M",
    quantity: 5,
    order: 1,
    ...overrides,
  });

// Every assertion checks the SAME contract: the product cache pattern was busted.
const expectProductCacheBusted = () =>
  expect(bust).toHaveBeenCalledWith(CacheKeys.productsPattern);

describe("variant writes bust the product cache", () => {
  it("createVariant busts the product cache", async () => {
    const product = await seedProduct();
    await createVariant({
      product: product._id,
      size: "L",
      quantity: 3,
    } as any);
    expectProductCacheBusted();
  });

  it("createManyVariants busts the product cache", async () => {
    const product = await seedProduct();
    await createManyVariants([
      { product: product._id, size: "S", quantity: 2 } as any,
      { product: product._id, size: "M", quantity: 4 } as any,
    ]);
    expectProductCacheBusted();
  });

  it("updateVariantQuantity (edit quantity) busts the product cache", async () => {
    const product = await seedProduct();
    const variant = await seedVariant(product._id);

    await updateVariantQuantity(variant._id.toString(), 99, product._id.toString());

    expectProductCacheBusted();
    // And the new value is actually persisted (so the rebuilt cache is fresh).
    const reloaded = await VariantModel.findById(variant._id);
    expect(reloaded!.quantity).toBe(99);
  });

  it("updateManyVariants (edit size/color/quantity) busts the product cache", async () => {
    const product = await seedProduct();
    const variant = await seedVariant(product._id);

    await updateManyVariants(product._id.toString(), [
      { _id: variant._id.toString(), quantity: 42 },
    ]);

    expectProductCacheBusted();
    const reloaded = await VariantModel.findById(variant._id);
    expect(reloaded!.quantity).toBe(42);
  });

  it("deleteVariant busts the product cache", async () => {
    const product = await seedProduct();
    const variant = await seedVariant(product._id);

    await deleteVariant(variant._id.toString(), product._id.toString());

    expectProductCacheBusted();
    expect(await VariantModel.findById(variant._id)).toBeNull();
  });

  it("deleteManyVariants busts the product cache", async () => {
    const product = await seedProduct();
    const v1 = await seedVariant(product._id, { size: "S" });
    const v2 = await seedVariant(product._id, { size: "M" });

    await deleteManyVariants(product._id.toString(), [
      v1._id.toString(),
      v2._id.toString(),
    ]);

    expectProductCacheBusted();
  });

  it("updateProductSoldOutStatus (the stock chokepoint) busts the product cache", async () => {
    const product = await seedProduct();
    await seedVariant(product._id, { quantity: 0 });

    await updateProductSoldOutStatus(product._id.toString());

    expectProductCacheBusted();
    // With no stock the product flips to sold-out — the cached feed must refresh.
    const reloaded = await ProductModel.findById(product._id);
    expect(reloaded!.isSoldOut).toBe(true);
  });
});
