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
    description?: {
      ar?: string;
      en?: string;
    };
    isNewArrival: boolean;
    isOnSale?: boolean;
    image: SubCategoryImage;
    createdBy:Types.ObjectId | string;
    createdAt: number;
    isDeleted?: boolean;
  }
  