import { Types, ClientSession } from "mongoose";
import ProductModel from "../Model/Product/ProductModel";
export const checkProductExists = async (_id: string | Types.ObjectId) => {
    return await ProductModel.exists({ _id });
}
export const findProductById = async (_id: string) => {
    return await ProductModel.findById(_id)
}
export const getProductsByIds = async (
  productIds: (Types.ObjectId | string)[],
  session?: ClientSession
) => {
  return await ProductModel.find({ _id: { $in: productIds } })
    .select("name finalPrice")
    .session(session || null)
    .lean();
};