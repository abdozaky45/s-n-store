import { Types } from "mongoose";
import CategoryModel from "../Model/Category/CategoryModel";
export const checkCategoryExists = async (_id: string | Types.ObjectId) => {
    return await CategoryModel.exists({ _id });

}
export const findCategoryById = async (_id: string) => {
    return await CategoryModel.findById(_id)

}