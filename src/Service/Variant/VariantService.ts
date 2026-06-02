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
  variants: { _id?: string; size?: string; color?: string; quantity?: number }[],
  session?: mongoose.ClientSession
) => {
  // Items without `_id` are new variants to create; items with `_id` update an
  // existing variant of this product. Nothing is deleted here — removing a
  // variant stays a separate, explicit action (DELETE /variant/bulk).
  const toCreate = variants
    .filter((v) => !v._id)
    .map((v) => ({
      product: productId,
      size: v.size ?? "one size",
      color: v.color,
      quantity: v.quantity ?? 0,
    }));

  const updateOps = variants
    .filter((v) => v._id)
    .map((v) => ({
      updateOne: {
        filter: { _id: v._id, product: productId },
        update: {
          $set: {
            ...(v.size !== undefined && { size: v.size }),
            ...(v.color !== undefined && { color: v.color }),
            ...(v.quantity !== undefined && { quantity: v.quantity }),
          },
        },
      },
    }));

  if (toCreate.length) await VariantModel.insertMany(toCreate, { session });
  if (updateOps.length) await VariantModel.bulkWrite(updateOps, { session });
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