import { Types } from "mongoose";
interface SubCategoryImage {
  mediaUrl: string;
  mediaId: string;
}
export default interface ISubCategory {
  subCategoryName: {
    ar: string;
    en: string;
  };
  category: Types.ObjectId | string;
  image: SubCategoryImage;
  createdBy: Types.ObjectId | string;
  isDeleted?: boolean;
}
