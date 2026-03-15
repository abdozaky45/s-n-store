import { Schema, model } from "mongoose";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import {
  ImageSchema,
  NotRequiredBoolean,
  NotRequiredNumber,
  RefType,
  RequiredNumber,
  RequiredString,
} from "../../Utils/Schemas";
import {IProduct} from "./Iproduct";

const ProductSizeSchema = new Schema({
  size: RequiredString,
  quantity: RequiredNumber,
}, { _id: false });

const ProductSchema = new Schema<IProduct>(
  {
    productName: {
      ar: RequiredString,
      en: RequiredString,
    },
    productDescription: {
      ar: RequiredString,
      en: RequiredString,
    },
    price: RequiredNumber,
    salePrice: NotRequiredNumber,
    finalPrice:RequiredNumber,
    wholesalePrice: NotRequiredNumber,
    isSale: NotRequiredBoolean,
    saleStartDate: NotRequiredNumber,
    saleEndDate: NotRequiredNumber,
    sizeVariants: [ProductSizeSchema],
    isSoldOut: NotRequiredBoolean,
    soldItems: NotRequiredNumber,
    defaultImage: ImageSchema,
    albumImages: { type: [ImageSchema], required: false },
    sizeChartImage: ImageSchema,
    category: RefType(SchemaTypesReference.Category, true),
    subCategory: RefType(SchemaTypesReference.SubCategory, false),
    isNewArrival: NotRequiredBoolean,
    isBestSeller: NotRequiredBoolean,
    createdBy: RefType(SchemaTypesReference.User, true),
    createdAt: RequiredNumber,
    isDeleted: NotRequiredBoolean,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
ProductSchema.virtual("discount").get(function () {
  if (!this.salePrice) return 0;
  return this.price - this.salePrice;
});
ProductSchema.virtual("discountPercentage").get(function () {
  if (!this.salePrice) return 0;
  return Math.round(((this.price - this.salePrice) / this.price) * 100);
});
ProductSchema.methods.isStock = function (size: string, requiredQuantity: number): boolean {
  const sizeVariant = this.sizeVariants.find(
    (s: { size: string; quantity: number }) => s.size === size
  );
  if (!sizeVariant) return false;
  return sizeVariant.quantity >= requiredQuantity;
};
const ProductModel = model(SchemaTypesReference.Product, ProductSchema);
export default ProductModel;
/*
  productName
  productDescription
  price
  salePrice
  wholesalePrice
  saleStartDate
  saleEndDate
  sizeVariants
  defaultImage
  albumImages
  sizeChartImage
  category
  subCategory
 */