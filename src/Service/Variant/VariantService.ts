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