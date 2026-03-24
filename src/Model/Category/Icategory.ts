import { Types } from "mongoose";
interface categoryImage {
    mediaUrl: string;
    mediaId: string;
  }
  export default interface ICategory {
    name: {
      ar: string;
      en: string;
    };
    image: categoryImage;
    createdBy:Types.ObjectId | string;
    isDeleted?: boolean;
  }
  