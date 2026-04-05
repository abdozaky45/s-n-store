import {Types} from "mongoose";
import CategoryModel from "../Model/Category/CategoryModel";
export const checkCategoryExists = async (_id: string | Types.ObjectId) => {
    const category = await CategoryModel.exists({ _id });
    return category;
}