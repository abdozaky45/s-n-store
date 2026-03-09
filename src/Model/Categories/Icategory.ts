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
    description?: {
      ar?: string;
      en?: string;
    };
    isNew: boolean;
    image: categoryImage;
    createdBy:Types.ObjectId | string;
    createdAt: number;
    isDeleted?: boolean;
  }
  