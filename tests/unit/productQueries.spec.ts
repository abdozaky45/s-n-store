import mongoose from "mongoose";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db";
import {
  getAllProductsForUser,
  getHomeProducts,
  softDeleteProduct,
  restoreProduct,
} from "../../src/Service/Product/ProductService";
import ProductModel from "../../src/Model/Product/ProductModel";
import { sortProductEnum } from "../../src/Utils/SortProduct";

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

let seq = 0;
const seedProduct = (overrides: Record<string, unknown> = {}) =>
  ProductModel.create({
    name: { ar: "منتج", en: "product" },
    description: { ar: "وصف", en: "desc" },
    price: 100,
    finalPrice: 100,
    category: new mongoose.Types.ObjectId(),
    createdBy: new mongoose.Types.ObjectId(),
    createdAt: Date.now() + seq++,
    ...overrides,
  });

describe("getAllProductsForUser", () => {
  it("never returns soft-deleted products", async () => {
    await seedProduct();
    await seedProduct();
    await seedProduct({ isDeleted: true });

    const result = await getAllProductsForUser({});
    expect(result.totalItems).toBe(2);
  });

  it("filters by category", async () => {
    const cat = new mongoose.Types.ObjectId();
    await seedProduct({ category: cat });
    await seedProduct();
    await seedProduct();

    const result = await getAllProductsForUser({ category: cat.toString() });
    expect(result.totalItems).toBe(1);
  });

  it("filters by isSale", async () => {
    await seedProduct({ isSale: true });
    await seedProduct({ isSale: false });
    await seedProduct({ isSale: false });

    const result = await getAllProductsForUser({ isSale: true });
    expect(result.totalItems).toBe(1);
  });

  it("sorts price low-to-high by finalPrice", async () => {
    await seedProduct({ finalPrice: 30 });
    await seedProduct({ finalPrice: 10 });
    await seedProduct({ finalPrice: 20 });

    const result = await getAllProductsForUser({ sort: sortProductEnum.priceLowToHigh });
    expect(result.products.map((p: any) => p.finalPrice)).toEqual([10, 20, 30]);
  });

  it("returns pagination metadata", async () => {
    await seedProduct();
    const result = await getAllProductsForUser({});
    expect(result).toMatchObject({ currentPage: 1, totalItems: 1, totalPages: 1 });
  });
});

describe("getHomeProducts", () => {
  it("returns at most 3 products per category", async () => {
    const category = new mongoose.Types.ObjectId();
    for (let i = 0; i < 5; i++) await seedProduct({ category });

    const result = await getHomeProducts({ isSale: false });
    expect(result.products).toHaveLength(3);
  });

  it("excludes soft-deleted products", async () => {
    const category = new mongoose.Types.ObjectId();
    await seedProduct({ category });
    await seedProduct({ category });
    await seedProduct({ category, isDeleted: true });

    const result = await getHomeProducts({ isSale: false });
    expect(result.products).toHaveLength(2);
  });

  it("returns only on-sale products when isSale is true", async () => {
    const category = new mongoose.Types.ObjectId();
    await seedProduct({ category, isSale: true });
    await seedProduct({ category, isSale: true });
    await seedProduct({ category, isSale: false });

    const result = await getHomeProducts({ isSale: true });
    expect(result.products).toHaveLength(2);
    expect(result.products.every((p: any) => p.isSale === true)).toBe(true);
  });
});

describe("softDeleteProduct / restoreProduct", () => {
  it("toggles the isDeleted flag", async () => {
    const product = await seedProduct();

    await softDeleteProduct(product._id);
    expect((await ProductModel.findById(product._id))!.isDeleted).toBe(true);

    await restoreProduct(product._id.toString());
    expect((await ProductModel.findById(product._id))!.isDeleted).toBe(false);
  });
});
