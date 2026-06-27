import VariantModel from "../../Model/Variant/VariantModel";
import ProductModel from "../../Model/Product/ProductModel";
import IVariant from "../../Model/Variant/IVariantModel";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import SizeCategoryModel from "../../Model/SizeCategory/SizeCategoryModel";
import CategoryModel from "../../Model/Category/CategoryModel";
import SubCategoryModel from "../../Model/SubCategory/SubCategoryModel";
import mongoose from "mongoose";
import { invalidatePattern, CacheKeys } from "../../Utils/Cache/cache";

// Sizes not defined in the product's SizeCategory group sort last.
const UNKNOWN_SIZE_ORDER = 9999;

// Resolve the display order (SizeCategory.order) for a product's sizes.
// The product's group comes from its subCategory (more specific) or category.
export const getSizeOrderMap = async (
  productId: string | mongoose.Types.ObjectId,
  sizes: string[],
  session?: mongoose.ClientSession
): Promise<Map<string, number>> => {
  const map = new Map<string, number>();
  const uniqueSizes = [...new Set(sizes.filter(Boolean))];
  if (!uniqueSizes.length) return map;

  const product = await ProductModel.findById(productId)
    .select("category subCategory")
    .session(session ?? null);
  if (!product) return map;

  let groupSize: mongoose.Types.ObjectId | string | null = null;
  if (product.subCategory) {
    const sub = await SubCategoryModel.findById(product.subCategory)
      .select("groupSize")
      .session(session ?? null);
    groupSize = (sub?.groupSize as mongoose.Types.ObjectId) ?? null;
  }
  if (!groupSize && product.category) {
    const cat = await CategoryModel.findById(product.category)
      .select("groupSize")
      .session(session ?? null);
    groupSize = (cat?.groupSize as mongoose.Types.ObjectId) ?? null;
  }
  if (!groupSize) return map;

  const sizeDocs = await SizeCategoryModel.find({ groupSize, size: { $in: uniqueSizes } })
    .select("size order")
    .session(session ?? null);
  for (const doc of sizeDocs) map.set(doc.size, doc.order);
  return map;
};

export const updateProductSoldOutStatus = async (productId: string) => {
  const hasStock = await VariantModel.exists({
    product: productId,
    quantity: { $gt: 0 },
  });
  await ProductModel.findByIdAndUpdate(productId, {
    isSoldOut: !hasStock,
  });
  // Central chokepoint: this runs after every stock-changing operation (order
  // placement, cancellation, status changes, variant edits). Variant quantity
  // and isSoldOut are embedded in the cached home feeds and product listings,
  // so drop the product caches here to keep stock-related data fresh.
  await invalidatePattern(CacheKeys.productsPattern);
};
export const createVariant = async (variantData: IVariant) => {
  const orderMap = await getSizeOrderMap(variantData.product, [variantData.size]);
  const variant = await VariantModel.create({
    ...variantData,
    order: orderMap.get(variantData.size) ?? UNKNOWN_SIZE_ORDER,
  });
  await updateProductSoldOutStatus(variantData.product.toString());
  return variant;
};
export const createManyVariants = async (variants: IVariant[], session?: mongoose.ClientSession) => {
  const productId = variants[0].product.toString();
  const orderMap = await getSizeOrderMap(productId, variants.map((v) => v.size), session);
  const variantsWithOrder = variants.map((v) => ({
    ...v,
    order: orderMap.get(v.size) ?? UNKNOWN_SIZE_ORDER,
  }));
  const created = await VariantModel.insertMany(variantsWithOrder, { session });
  await updateProductSoldOutStatus(productId);
  return created;
};
export const upsertProductVariants = async (
  productId: string,
  variants: { size?: string; color?: string; quantity?: number }[],
  session?: mongoose.ClientSession
) => {
  // Full sync: the incoming list is the product's COMPLETE desired variant set.
  // Identity is (product + size + color), already unique via the schema index, so
  // no `_id` is needed. We upsert every listed variant and delete any existing one
  // that's no longer in the list — this covers add / edit-quantity / remove /
  // change-size-or-color in a single call, with no duplicates.
  //
  // Guard: an empty list is treated as "no change" (it never wipes all variants);
  // removing every variant must go through DELETE /variant/bulk explicitly.
  if (!variants.length) return;

  const identities = variants.map((v) => ({
    size: v.size ?? "one size",
    color: v.color ?? null,
  }));

  // Resolve the display order for every desired size up front (one lookup).
  const orderMap = await getSizeOrderMap(
    productId,
    identities.map((id) => id.size),
    session
  );

  // 1) Upsert each desired variant by (product + size + color). Mongoose casts the
  //    `color` string -> ObjectId so the ref stays valid; `null` = colorless.
  const ops = variants.map((v, i) => ({
    updateOne: {
      filter: { product: productId, size: identities[i].size, color: identities[i].color },
      update: {
        $set: {
          quantity: v.quantity ?? 0,
          order: orderMap.get(identities[i].size) ?? UNKNOWN_SIZE_ORDER,
        },
      },
      upsert: true,
    },
  }));
  await VariantModel.bulkWrite(ops, { session });

  // 2) Delete any existing variant for this product that isn't in the desired set.
  await VariantModel.deleteMany(
    {
      product: productId,
      $nor: identities.map((id) => ({ size: id.size, color: id.color })),
    },
    { session }
  );
};
export const updateManyVariants = async (
  productId: string,
  variants: { _id: string; size?: string; color?: string; quantity?: number }[]
) => {
  // Re-stamp order only for variants whose size is changing.
  const changedSizes = variants
    .filter((v) => v.size !== undefined)
    .map((v) => v.size as string);
  const orderMap = changedSizes.length
    ? await getSizeOrderMap(productId, changedSizes)
    : new Map<string, number>();

  const bulkOps = variants.map(variant => ({
    updateOne: {
      filter: { _id: variant._id, product: productId },
      update: {
        $set: {
          ...(variant.size !== undefined && {
            size: variant.size,
            order: orderMap.get(variant.size) ?? UNKNOWN_SIZE_ORDER,
          }),
          ...(variant.color !== undefined && { color: variant.color }),
          ...(variant.quantity !== undefined && { quantity: variant.quantity }),
        }
      }
    }
  }));

  const result = await VariantModel.bulkWrite(bulkOps);
  // Variant size/color/quantity are embedded in cached product responses.
  await invalidatePattern(CacheKeys.productsPattern);
  return result;
};
export const deleteManyVariants = async (
  productId: string,
  variantIds: string[]
) => {
  const result = await VariantModel.deleteMany({
    _id: { $in: variantIds },
    product: productId,
  });
  await invalidatePattern(CacheKeys.productsPattern);
  return result;
};
export const getVariantsByProduct = async (productId: string) => {
  const variants = await VariantModel.find({ product: productId })
    .sort({ order: 1, _id: 1 })
    .populate({ path: SchemaTypesReference.Color, select: "-__v" })
    .select("-__v");
  return variants;
};
export const getVariantById = async (_id: string) => {
  const variant = await VariantModel.findById(_id)
    .populate({ path: SchemaTypesReference.Color, select: "-__v" })
    .select("-__v");
  return variant;
};
export const updateVariantQuantity = async (
  _id: string,
  quantity: number,
  productId: string
) => {
  const variant = await VariantModel.findByIdAndUpdate(
    _id,
    { quantity },
    { new: true }
  );
  await updateProductSoldOutStatus(productId);
  return variant;
};
export const deleteVariant = async (_id: string, productId: string) => {
  const variant = await VariantModel.findByIdAndDelete(_id);
  await updateProductSoldOutStatus(productId);
  return variant;
};
export const getVariantStock = async (variantIds: string[]) => {
  return await VariantModel.find({
    _id: { $in: variantIds },
  }).select("_id quantity");
}
export const getVariantsByIds = async (variantIds: string[], session?: mongoose.ClientSession) => {
  const variants = await VariantModel.find({ _id: { $in: variantIds } }).session(session || null);
  return variants;
}