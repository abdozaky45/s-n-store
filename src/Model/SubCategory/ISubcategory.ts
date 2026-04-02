import { Types } from "mongoose";
interface SubCategoryImage {
  mediaUrl: string;
  mediaId: string;
}
export default interface ISubCategory {
  name: {
    ar: string;
    en: string;
  };
   groupSize: Types.ObjectId | string; 
  category: Types.ObjectId | string;
  image: SubCategoryImage;
  createdBy: Types.ObjectId | string;
  isDeleted?: boolean;
}
