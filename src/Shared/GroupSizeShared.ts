import { Types } from "mongoose";
import GroupSizeModel from "../Model/GroupSize/GroupSize";
import SizeCategoryModel from "../Model/SizeCategory/SizeCategoryModel";
export const checkGroupSizeExists = async (_id: string | Types.ObjectId) => {
   return await GroupSizeModel.exists({ _id });

}
export const checkSizeCategoryExistsById = async (_id: string) => {
    return await SizeCategoryModel.exists({ _id });
  
}