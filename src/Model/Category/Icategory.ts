import { Types } from "mongoose";
interface categoryImage {
    mediaUrl: string;
    mediaId: string;
  }
  export default interface ICategory {
    categoryName: {
      ar: string;
      en: string;
    };
    image: categoryImage;
    createdBy:Types.ObjectId | string;
    isDeleted?: boolean;
  }
  