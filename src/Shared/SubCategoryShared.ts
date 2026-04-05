import { Types } from "mongoose";
import SubCategoryModel from "../Model/SubCategory/SubCategoryModel";
export const checkSubCategoryExists = async (_id: string | Types.ObjectId) => {
    return await SubCategoryModel.exists({ _id });
}
export const findSubCategoryById = async (_id: string) => {
    return await SubCategoryModel.findById(_id)
}