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
ProductSchema.virtual("variants",{  
  ref: SchemaTypesReference.Variant,
  localField: "_id",
  foreignField: SchemaTypesReference.Product,
});
ProductSchema.virtual("discount").get(function () {
  if (!this.salePrice) return 0;
  return this.price - this.salePrice;
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