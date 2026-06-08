import mongoose from "mongoose";
import {
  ratioCalculatePrice,
  updateProduct,
} from "../../src/Service/Product/ProductService";
import ProductModel from "../../src/Model/Product/ProductModel";

// updateProduct only mutates an in-memory document (no save), and
// ratioCalculatePrice is pure — neither needs a DB connection.
const makeProductDoc = (overrides: Record<string, unknown> = {}) =>
  new ProductModel({
    name: { ar: "اسم", en: "name" },
    description: { ar: "وصف", en: "desc" },
    price: 100,
    finalPrice: 100,
    category: new mongoose.Types.ObjectId(),
    createdBy: new mongoose.Types.ObjectId(),
    createdAt: Date.now(),
    ...overrides,
  });

describe("ratioCalculatePrice", () => {
  it("is not on sale when there is no salePrice", () => {
    expect(ratioCalculatePrice(100, 0, 0, 0)).toEqual({
      isSale: false,
      saleStartDate: 0,
      saleEndDate: 0,
      finalPrice: 100,
    });
  });

  it("is not on sale when salePrice is >= price (invalid discount)", () => {
    const result = ratioCalculatePrice(100, 120, 5, 9);
    expect(result.isSale).toBe(false);
    expect(result.finalPrice).toBe(100);
  });

  it("is on sale when salePrice < price, using salePrice as finalPrice", () => {
    expect(ratioCalculatePrice(100, 80, 1000, 2000)).toEqual({
      isSale: true,
      finalPrice: 80,
      saleStartDate: 1000,
      saleEndDate: 2000,
    });
  });
});

describe("updateProduct", () => {
  it("returns null when the body carries no updates", async () => {
    const product = makeProductDoc();
    const result = await updateProduct(product as any, {} as any);
    expect(result).toBeNull();
  });

  it("applies simple fields (price / finalPrice / salePrice)", async () => {
    const product = makeProductDoc({ price: 100, finalPrice: 100 });
    const result = await updateProduct(product as any, {
      price: 200,
      finalPrice: 180,
      salePrice: 180,
    } as any);
    expect(result).not.toBeNull();
    expect(product.price).toBe(200);
    expect(product.finalPrice).toBe(180);
    expect(product.salePrice).toBe(180);
  });

  it("merges name partially, keeping the untouched language", async () => {
    const product = makeProductDoc({ name: { ar: "قديم", en: "old" } });
    await updateProduct(product as any, { name: { ar: "جديد" } } as any);
    expect(product.name.ar).toBe("جديد");
    expect(product.name.en).toBe("old");
  });

  it("flags bestSellerManual whenever isBestSeller is set (true or false)", async () => {
    const onProduct = makeProductDoc();
    await updateProduct(onProduct as any, { isBestSeller: true } as any);
    expect(onProduct.isBestSeller).toBe(true);
    expect(onProduct.bestSellerManual).toBe(true);

    const offProduct = makeProductDoc();
    await updateProduct(offProduct as any, { isBestSeller: false } as any);
    expect(offProduct.isBestSeller).toBe(false);
    expect(offProduct.bestSellerManual).toBe(true);
  });
});
