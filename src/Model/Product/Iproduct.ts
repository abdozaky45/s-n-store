import { Types } from "mongoose";
interface ProductImage {
  mediaUrl: string;
  mediaId: string;
}
export  interface IProduct {
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  price: number;
  salePrice?: number;
  finalPrice: number;
  wholesalePrice?: number;
  isSale?: boolean;
  saleStartDate?: number;
  saleEndDate?: number;
  isSoldOut?: boolean;
  defaultImage: ProductImage;
  albumImages?: ProductImage[];
  sizeChartImage?: ProductImage;
  category: Types.ObjectId | string;
  subCategory?: Types.ObjectId | string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  createdBy: Types.ObjectId | string;
  createdAt: number;
  isDeleted?: boolean;
  soldItems?: number;
}
export interface IUpdateProductBody {
  name?: { ar: string; en: string };
  description?: { ar: string; en: string };
  price?: number;
  salePrice?: number;
  finalPrice?: number;
  wholesalePrice?: number;
  isSale?: boolean;
  saleStartDate?: number;
  saleEndDate?: number;
  category?:string;
  subCategory?: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  defaultImage?: string;
  albumImages?: string[];
  sizeChartImage?: string;
}