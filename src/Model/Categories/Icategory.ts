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
    isNewArrival: boolean;
    isOnSale?: boolean;
    image: categoryImage;
    createdBy:Types.ObjectId | string;
    createdAt: number;
    isDeleted?: boolean;
  }
  