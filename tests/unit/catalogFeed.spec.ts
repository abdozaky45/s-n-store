/**
 * Catalog feed (Meta / Google shopping) tests.
 *
 * The feed price MUST match what checkout charges (product.finalPrice), or the
 * ad platforms flag/reject items. These tests pin the pricing/sale_price
 * mapping, the per-variant item shape, the skip reasons, and the public
 * GET /catalog/feed.xml endpoint against an in-memory MongoDB.
 */
import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db";
import ProductModel from "../../src/Model/Product/ProductModel";
import VariantModel from "../../src/Model/Variant/VariantModel";
import CategoryModel from "../../src/Model/Category/CategoryModel";
import SubCategoryModel from "../../src/Model/SubCategory/SubCategoryModel";
import ColorModel from "../../src/Model/Color/ColorModel";
import CatalogRouter from "../../src/Router/Catalog/CatalogRouter";
import { globalErrorHandling } from "../../src/Utils/ErrorHandling";
import {
  buildFeedItem,
  buildFeedItems,
  escapeXml,
  renderFeedXml,
  resolvePricing,
  FeedProduct,
  FeedVariant,
} from "../../src/Service/Catalog/CatalogFeedService";

const productId = new mongoose.Types.ObjectId();
const variantId = new mongoose.Types.ObjectId();
const colorId = new mongoose.Types.ObjectId();

const makeProduct = (overrides: Partial<FeedProduct> = {}): FeedProduct => ({
  _id: productId,
  name: { ar: "قميص نوم", en: "Nightgown" },
  description: { ar: "<p>وصف <strong>جميل</strong></p>", en: "desc" },
  price: 500,
  finalPrice: 500,
  isSale: false,
  defaultImage: { mediaUrl: "https://cdn.test/default.jpg" },
  albumImages: [],
  ...overrides,
});

const makeVariant = (overrides: Partial<FeedVariant> = {}): FeedVariant => ({
  _id: variantId,
  size: "M",
  color: { _id: colorId, name: { ar: "أحمر", en: "Red" } },
  quantity: 3,
  ...overrides,
});

const itemOf = (product: FeedProduct, variant: FeedVariant = makeVariant()) => {
  const result = buildFeedItem(product, variant);
  if (!("item" in result)) throw new Error(`unexpected skip: ${result.skipReason}`);
  return result.item;
};

const skipReasonOf = (product: FeedProduct, variant: FeedVariant = makeVariant()) => {
  const result = buildFeedItem(product, variant);
  return "skipReason" in result ? result.skipReason : null;
};

describe("resolvePricing (must match checkout's finalPrice)", () => {
  it("uses finalPrice as g:price with no sale_price when not on sale", () => {
    expect(resolvePricing(makeProduct({ price: 500, finalPrice: 500 }))).toEqual({
      price: 500,
      salePrice: undefined,
    });
  });

  it("sends regular price + finalPrice as sale_price while on sale", () => {
    expect(resolvePricing(makeProduct({ isSale: true, price: 500, finalPrice: 400 }))).toEqual({
      price: 500,
      salePrice: 400,
    });
  });

  it("ignores an invalid sale (finalPrice >= price) and charges finalPrice", () => {
    expect(resolvePricing(makeProduct({ isSale: true, price: 500, finalPrice: 500 }))).toEqual({
      price: 500,
      salePrice: undefined,
    });
  });

  it("never emits sale_price when isSale is false, even if finalPrice < price", () => {
    expect(resolvePricing(makeProduct({ isSale: false, price: 500, finalPrice: 450 }))).toEqual({
      price: 450,
      salePrice: undefined,
    });
  });
});

describe("buildFeedItem", () => {
  it("maps a variant to a feed item", () => {
    const item = itemOf(makeProduct({ isSale: true, price: 500, finalPrice: 399.5 }));
    expect(item).toMatchObject({
      id: variantId.toString(),
      itemGroupId: productId.toString(),
      title: "قميص نوم - أحمر / M",
      description: "وصف جميل",
      availability: "in stock",
      price: "500.00 EGP",
      salePrice: "399.50 EGP",
      link: `https://sn-lingerie.com/products/${productId}?color=${colorId}&size=M`,
      imageLink: "https://cdn.test/default.jpg",
      color: "أحمر",
      size: "M",
    });
  });

  it("marks out-of-stock variants instead of dropping them", () => {
    expect(itemOf(makeProduct(), makeVariant({ quantity: 0 })).availability).toBe("out of stock");
  });

  it("builds the title from whichever attributes exist", () => {
    expect(itemOf(makeProduct(), makeVariant({ color: null })).title).toBe("قميص نوم - M");
    expect(itemOf(makeProduct(), makeVariant({ size: "one Size" })).title).toBe("قميص نوم - أحمر");
    expect(itemOf(makeProduct(), makeVariant({ color: null, size: "one Size" })).title).toBe("قميص نوم");
  });

  it("keeps the link unique per variant and omits absent params", () => {
    expect(itemOf(makeProduct(), makeVariant({ color: null, size: "XL" })).link).toBe(
      `https://sn-lingerie.com/products/${productId}?size=XL`
    );
  });

  it("falls back to English when Arabic text is missing", () => {
    const item = itemOf(makeProduct({ name: { ar: "", en: "Nightgown" } }));
    expect(item.title).toBe("Nightgown - أحمر / M");
  });

  it("adds album images (minus the default, max 10) and Category > SubCategory", () => {
    const album = Array.from({ length: 12 }, (_, i) => ({ mediaUrl: `https://cdn.test/${i}.jpg` }));
    const item = itemOf(
      makeProduct({
        albumImages: [{ mediaUrl: "https://cdn.test/default.jpg" }, ...album],
        category: { name: { ar: "ملابس نوم", en: "Sleepwear" } },
        subCategory: { name: { ar: "قمصان", en: "Gowns" } },
      })
    );
    expect(item.additionalImageLinks).toHaveLength(10);
    expect(item.additionalImageLinks).not.toContain("https://cdn.test/default.jpg");
    expect(item.productType).toBe("ملابس نوم > قمصان");
  });

  it.each([
    ["missing product name", { name: { ar: "", en: "" } }],
    ["missing product description", { description: { ar: "<p> </p>", en: "" } }],
    ["missing or invalid price", { price: 0, finalPrice: 0 }],
    ["missing default image", { defaultImage: undefined }],
  ])("skips the variant: %s", (reason, overrides) => {
    expect(skipReasonOf(makeProduct(overrides as Partial<FeedProduct>))).toBe(reason);
  });
});

describe("renderFeedXml", () => {
  it("escapes XML special characters", () => {
    expect(escapeXml(`a<b>&"c'`)).toBe("a&lt;b&gt;&amp;&quot;c&apos;");
  });

  it("renders RSS 2.0 with the Google namespace and only the tags that apply", () => {
    const xml = renderFeedXml([itemOf(makeProduct())]);
    expect(xml).toContain('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">');
    expect(xml).toContain("<g:price>500.00 EGP</g:price>");
    expect(xml).toContain("&amp;size=M</g:link>");
    expect(xml).toContain("<g:brand>SN Lingerie</g:brand>");
    expect(xml).toContain("<g:gender>female</g:gender>");
    expect(xml).toContain("<g:age_group>adult</g:age_group>");
    expect(xml).not.toContain("<g:sale_price>");
    expect(xml).not.toContain("<g:product_type>");
    expect(xml).not.toContain("google_product_category");
  });
});

describe("catalog feed (DB)", () => {
  beforeAll(connectTestDB);
  afterEach(clearTestDB);
  afterAll(closeTestDB);

  const userId = new mongoose.Types.ObjectId();

  const seed = async () => {
    const category = await CategoryModel.create({
      name: { ar: "ملابس نوم", en: "Sleepwear" },
      groupSize: new mongoose.Types.ObjectId(),
      image: { mediaUrl: "https://cdn.test/c.jpg", mediaId: "c" },
      createdBy: userId,
    });
    const subCategory = await SubCategoryModel.create({
      name: { ar: "قمصان", en: "Gowns" },
      groupSize: new mongoose.Types.ObjectId(),
      category: category._id,
      image: { mediaUrl: "https://cdn.test/s.jpg", mediaId: "s" },
      createdBy: userId,
    });
    const color = await ColorModel.create({ name: { ar: "أسود", en: "Black" }, hex: "#000000" });
    const base = {
      description: { ar: "وصف", en: "desc" },
      price: 300,
      finalPrice: 250,
      isSale: true,
      defaultImage: { mediaUrl: "https://cdn.test/p.jpg", mediaId: "p" },
      category: category._id,
      subCategory: subCategory._id,
      createdBy: userId,
      createdAt: Date.now(),
    };
    const live = await ProductModel.create({ ...base, name: { ar: "منتج", en: "Live" }, isDeleted: false });
    const deleted = await ProductModel.create({ ...base, name: { ar: "محذوف", en: "Deleted" }, isDeleted: true });
    await VariantModel.create([
      { product: live._id, size: "L", color: color._id, quantity: 2, order: 2 },
      { product: live._id, size: "S", color: color._id, quantity: 0, order: 1 },
      { product: deleted._id, size: "M", color: color._id, quantity: 5 },
    ]);
    return { live };
  };

  it("lists every variant of live products with populated color/category", async () => {
    const { live } = await seed();
    const { items, skipped } = await buildFeedItems();
    expect(skipped).toBe(0);
    expect(items.map((i) => i.title)).toEqual(["منتج - أسود / S", "منتج - أسود / L"]);
    expect(items.every((i) => i.itemGroupId === live._id.toString())).toBe(true);
    expect(items.map((i) => i.availability)).toEqual(["out of stock", "in stock"]);
    expect(items[0]).toMatchObject({
      price: "300.00 EGP",
      salePrice: "250.00 EGP",
      productType: "ملابس نوم > قمصان",
      color: "أسود",
    });
  });

  it("serves GET /catalog/feed.xml publicly as cacheable XML", async () => {
    await seed();
    const app = express();
    app.use("/catalog", CatalogRouter);
    app.use(globalErrorHandling);
    const res = await request(app).get("/catalog/feed.xml");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/xml/);
    expect(res.headers["cache-control"]).toBe("public, max-age=600");
    expect(res.text.match(/<item>/g)).toHaveLength(2);
    expect(res.text).not.toContain("محذوف");
  });
});
