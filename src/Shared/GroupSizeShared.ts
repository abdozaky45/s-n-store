import { Types } from "mongoose";
import GroupSizeModel from "../Model/GroupSize/GroupSize";
export const checkGroupSizeExists = async (_id: string | Types.ObjectId) => {
    const groupSize = await GroupSizeModel.exists({ _id });
    return groupSize;
}