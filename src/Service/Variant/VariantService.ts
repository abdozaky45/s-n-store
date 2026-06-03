import VariantModel from "../../Model/Variant/VariantModel";
import ProductModel from "../../Model/Product/ProductModel";
import IVariant from "../../Model/Variant/IVariantModel";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import mongoose from "mongoose";

export const updateProductSoldOutStatus = async (productId: string) => {
  const hasStock = await VariantModel.exists({
    product: productId,
    quantity: { $gt: 0 },
  });
  await ProductModel.findByIdAndUpdate(productId, {
    isSoldOut: !hasStock,
  });
};
export const createVariant = async (variantData: IVariant) => {
  const variant = await VariantModel.create(variantData);
  await updateProductSoldOutStatus(variantData.product.toString());
  return variant;
};
export const createManyVariants = async (variants: IVariant[], session?: mongoose.ClientSession) => {
  const created = await VariantModel.insertMany(variants, { session });
  const productId = variants[0].product.toString();
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

  // 1) Upsert each desired variant by (product + size + color). Mongoose casts the
  //    `color` string -> ObjectId so the ref stays valid; `null` = colorless.
  const ops = variants.map((v, i) => ({
    updateOne: {
      filter: { product: productId, size: identities[i].size, color: identities[i].color },
      update: { $set: { quantity: v.quantity ?? 0 } },
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
  const bulkOps = variants.map(variant => ({
    updateOne: {
      filter: { _id: variant._id, product: productId },
      update: {
        $set: {
          ...(variant.size !== undefined && { size: variant.size }),
          ...(variant.color !== undefined && { color: variant.color }),
          ...(variant.quantity !== undefined && { quantity: variant.quantity }),
        }
      }
    }
  }));

  return VariantModel.bulkWrite(bulkOps);
};
export const deleteManyVariants = async (
  productId: string,
  variantIds: string[]
) => {
  return VariantModel.deleteMany({
    _id: { $in: variantIds },
    product: productId,
  });
};
export const getVariantsByProduct = async (productId: string) => {
  const variants = await VariantModel.find({ product: productId })
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