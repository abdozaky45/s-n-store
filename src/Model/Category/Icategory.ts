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
    image_svg?: categoryImage;
    createdBy:Types.ObjectId | string;
    isDeleted?: boolean;
  }
  