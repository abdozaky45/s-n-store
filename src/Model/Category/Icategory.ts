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
    groupSize:string | Types.ObjectId;
    image: categoryImage;
    image_svg?: Types.ObjectId | string;
    createdBy:Types.ObjectId | string;
    isDeleted?: boolean;
  }
  