import { Types } from "mongoose";
import ProductModel from "../../Model/Product/ProductModel";
import VariantModel from "../../Model/Variant/VariantModel";
// Registered for populate() (category / subCategory / color refs).
import "../../Model/Category/CategoryModel";
import "../../Model/SubCategory/SubCategoryModel";
import "../../Model/Color/ColorModel";
import { STOREFRONT_URL, getStorefrontProductUrl } from "../../config";
import { stripHtml } from "../../Utils/ShareHtml";

// Public product catalog feed (RSS 2.0 + Google namespace) consumed by Meta
// Commerce Manager / Google Merchant Center as a scheduled data feed.
// Read-only: one <item> per variant, grouped under the parent product via
// g:item_group_id. Arabic text, since the ads target the Egyptian market.

export const BRAND_NAME = "SN Lingerie";
export const CURRENCY = "EGP";
// Variant.size schema default — means "no real size", so keep it out of titles.
const DEFAULT_SIZE = "one Size";
// Google caps descriptions at 5000 chars and additional images at 10.
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_ADDITIONAL_IMAGES = 10;

type LocalizedName = { ar?: string; en?: string };

export interface FeedProduct {
  _id: Types.ObjectId | string;
  name?: LocalizedName;
  description?: LocalizedName;
  price?: number;
  finalPrice?: number;
  isSale?: boolean;
  defaultImage?: { mediaUrl?: string };
  albumImages?: { mediaUrl?: string }[];
  category?: { name?: LocalizedName } | null;
  subCategory?: { name?: LocalizedName } | null;
}

export interface FeedVariant {
  _id: Types.ObjectId | string;
  size?: string;
  color?: { _id: Types.ObjectId | string; name?: LocalizedName } | null;
  quantity?: number;
}

export interface FeedItem {
  id: string;
  itemGroupId: string;
  title: string;
  description: string;
  availability: "in stock" | "out of stock";
  price: string;
  salePrice?: string;
  link: string;
  imageLink: string;
  additionalImageLinks: string[];
  productType?: string;
  color?: string;
  size?: string;
}

export const escapeXml = (value: string): string =>
  value
    // Control characters are illegal in XML 1.0 and would break the whole feed.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const formatPrice = (n: number) => `${round2(n).toFixed(2)} ${CURRENCY}`;

const localized = (value?: LocalizedName) => (value?.ar || value?.en || "").trim();

// Descriptions are stored as rich-text HTML; feeds need plain text.
const normalizeDescription = (html: string) => {
  const text = stripHtml(html).replace(/\s+/g, " ").trim();
  return text.length > MAX_DESCRIPTION_LENGTH
    ? `${text.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`
    : text;
};

// Mirrors checkout, which always charges product.finalPrice. While a sale is
// active the regular price is sent as g:price and finalPrice as g:sale_price,
// so the ad shows the strikethrough while the effective price still matches
// checkout. No sale_price_effective_date on purpose: checkout ignores
// saleStartDate, and the nightly agenda (not saleEndDate itself) ends the sale.
export const resolvePricing = (product: FeedProduct) => {
  const price = product.price ?? 0;
  const finalPrice = product.finalPrice ?? price;
  if (product.isSale && finalPrice > 0 && finalPrice < price) {
    return { price, salePrice: finalPrice };
  }
  return { price: finalPrice, salePrice: undefined };
};

const buildLink = (productId: string, colorId?: string, size?: string) => {
  // The storefront ignores these params; they only give each variant a unique
  // URL, which Meta/Google expect per item.
  const params = new URLSearchParams();
  if (colorId) params.set("color", colorId);
  if (size) params.set("size", size);
  const query = params.toString();
  return `${getStorefrontProductUrl(productId)}${query ? `?${query}` : ""}`;
};

// Returns the feed item, or the reason the variant can't be listed.
export const buildFeedItem = (
  product: FeedProduct,
  variant: FeedVariant
): { item: FeedItem } | { skipReason: string } => {
  const name = localized(product.name);
  if (!name) return { skipReason: "missing product name" };
  const description = normalizeDescription(localized(product.description));
  if (!description) return { skipReason: "missing product description" };
  const { price, salePrice } = resolvePricing(product);
  if (!(price > 0)) return { skipReason: "missing or invalid price" };
  const imageLink = product.defaultImage?.mediaUrl?.trim();
  if (!imageLink) return { skipReason: "missing default image" };

  const productId = product._id.toString();
  const colorId = variant.color?._id?.toString();
  const colorName = localized(variant.color?.name ?? undefined);
  const size = variant.size?.trim() || undefined;
  const titleSize = size && size !== DEFAULT_SIZE ? size : undefined;
  const attributes = [colorName, titleSize].filter(Boolean).join(" / ");

  const categoryName = localized(product.category?.name);
  const subCategoryName = localized(product.subCategory?.name);
  const productType = [categoryName, subCategoryName].filter(Boolean).join(" > ");

  const additionalImageLinks = (product.albumImages || [])
    .map((image) => image?.mediaUrl?.trim())
    .filter((url): url is string => !!url && url !== imageLink)
    .slice(0, MAX_ADDITIONAL_IMAGES);

  return {
    item: {
      id: variant._id.toString(),
      itemGroupId: productId,
      title: attributes ? `${name} - ${attributes}` : name,
      description,
      availability: (variant.quantity ?? 0) > 0 ? "in stock" : "out of stock",
      price: formatPrice(price),
      salePrice: salePrice !== undefined ? formatPrice(salePrice) : undefined,
      link: buildLink(productId, colorId, size),
      imageLink,
      additionalImageLinks,
      productType: productType || undefined,
      color: colorName || undefined,
      size,
    },
  };
};

export const buildFeedItems = async () => {
  // Two reads, no N+1: live products (with category/subCategory), then all
  // their variants (with color). Soft-deleted products keep their variants in
  // the DB, so filtering on the product side keeps them out without noise.
  const products = await ProductModel.find({ isDeleted: { $ne: true } })
    .select("name description price finalPrice isSale defaultImage albumImages category subCategory createdAt")
    .populate({ path: "category", select: "name" })
    .populate({ path: "subCategory", select: "name" })
    .sort({ createdAt: -1 })
    .lean<FeedProduct[]>();

  const variants = await VariantModel.find({ product: { $in: products.map((p) => p._id) } })
    .select("product size color quantity order")
    .populate({ path: "color", select: "name" })
    .sort({ order: 1, _id: 1 })
    .lean<(FeedVariant & { product: Types.ObjectId })[]>();

  const variantsByProduct = new Map<string, FeedVariant[]>();
  for (const variant of variants) {
    const key = variant.product.toString();
    const list = variantsByProduct.get(key) || [];
    list.push(variant);
    variantsByProduct.set(key, list);
  }

  const items: FeedItem[] = [];
  let skipped = 0;
  for (const product of products) {
    for (const variant of variantsByProduct.get(product._id.toString()) || []) {
      const result = buildFeedItem(product, variant);
      if ("item" in result) {
        items.push(result.item);
      } else {
        skipped++;
        console.warn(`[catalog-feed] skipped variant ${variant._id}: ${result.skipReason}`);
      }
    }
  }
  return { items, skipped };
};

const tag = (name: string, value?: string) =>
  value ? `      <g:${name}>${escapeXml(value)}</g:${name}>\n` : "";

const renderItem = (item: FeedItem) =>
  "    <item>\n" +
  tag("id", item.id) +
  tag("item_group_id", item.itemGroupId) +
  tag("title", item.title) +
  tag("description", item.description) +
  tag("availability", item.availability) +
  tag("condition", "new") +
  tag("price", item.price) +
  tag("link", item.link) +
  tag("sale_price", item.salePrice) +
  tag("image_link", item.imageLink) +
  item.additionalImageLinks.map((url) => tag("additional_image_link", url)).join("") +
  tag("brand", BRAND_NAME) +
  tag("product_type", item.productType) +
  // TODO: add g:google_product_category once a taxonomy mapping is agreed.
  tag("color", item.color) +
  tag("size", item.size) +
  tag("gender", "female") +
  tag("age_group", "adult") +
  "    </item>\n";

export const renderFeedXml = (items: FeedItem[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(BRAND_NAME)} Product Catalog</title>
    <link>${escapeXml(STOREFRONT_URL)}</link>
    <description>${escapeXml(BRAND_NAME)} product feed for Meta / Google shopping</description>
${items.map(renderItem).join("")}  </channel>
</rss>
`;

export const getCatalogFeed = async () => {
  const { items, skipped } = await buildFeedItems();
  return { xml: renderFeedXml(items), itemCount: items.length, skipped };
};
