import { Types } from "mongoose";

interface ProductImage {
  mediaUrl: string;
  mediaId: string;
}

interface ProductSize {
  size: string;
  quantity: number;
}

export  interface IProduct {
  productName: { ar: string; en: string };
  productDescription: { ar: string; en: string };
  price: number;
  salePrice?: number;
  finalPrice: number;
  wholesalePrice?: number;
  isSale?: boolean;
  saleStartDate?: number;
  saleEndDate?: number;
  sizeVariants: ProductSize[];
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
  productNameAr?: string;
  productNameEn?: string;
  productDescriptionAr?: string;
  productDescriptionEn?: string;
  price?: number;
  salePrice?: number;
  finalPrice?: number;
  wholesalePrice?: number;
  isSale?: boolean;
  saleStartDate?: number;
  saleEndDate?: number;
  sizeVariants?: { size: string; quantity: number }[];
  category?:string;
  subCategory?: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  defaultImage?: string;
  albumImages?: string[];
  sizeChartImage?: string;
}