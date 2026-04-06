import {Types} from "mongoose";
import ProductModel from "../Model/Product/ProductModel";
export const checkProductExists = async (_id: string | Types.ObjectId) => {
    return await ProductModel.exists({ _id });
}
export const findProductById = async (_id: string) => {
    return await ProductModel.findById(_id)
}