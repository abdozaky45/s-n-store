"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageSchema = void 0;
const mongoose_1 = require("mongoose");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const Schemas_1 = require("../../Utils/Schemas");
exports.ImageSchema = new mongoose_1.Schema({
    mediaUrl: { type: String, required: true },
    mediaId: { type: String, required: true },
}, { _id: false });
const ProductSchema = new mongoose_1.Schema({
    name: {
        ar: Schemas_1.RequiredString,
        en: Schemas_1.RequiredString,
    },
    description: {
        ar: Schemas_1.RequiredString,
        en: Schemas_1.RequiredString,
    },
    price: Schemas_1.RequiredNumber,
    salePrice: Schemas_1.NotRequiredNumber,
    finalPrice: Schemas_1.RequiredNumber,
    wholesalePrice: Schemas_1.NotRequiredNumber,
    isSale: Schemas_1.NotRequiredBoolean,
    saleStartDate: Schemas_1.NotRequiredNumber,
    saleEndDate: Schemas_1.NotRequiredNumber,
    isSoldOut: Schemas_1.NotRequiredBoolean,
    soldItems: Schemas_1.NotRequiredNumber,
    defaultImage: exports.ImageSchema,
    albumImages: { type: [exports.ImageSchema], required: false },
    sizeChartImage: exports.ImageSchema,
    category: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.Category, true),
    subCategory: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.SubCategory, false),
    isNewArrival: Schemas_1.NotRequiredBoolean,
    isBestSeller: Schemas_1.NotRequiredBoolean,
    createdBy: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.User, true),
    createdAt: Schemas_1.RequiredNumber,
    isDeleted: Schemas_1.NotRequiredBoolean,
}, { toJSON: { virtuals: true }, toObject: { virtuals: true }, id: false });
ProductSchema.virtual("variants", {
    ref: SchemaTypesReference_1.default.Variant,
    localField: "_id",
    foreignField: SchemaTypesReference_1.default.Product,
});
ProductSchema.virtual("discount").get(function () {
    if (!this.salePrice)
        return 0;
    return this.price - this.salePrice;
});
ProductSchema.virtual("discountPercentage").get(function () {
    if (!this.salePrice)
        return 0;
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
});
const ProductModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.Product, ProductSchema);
exports.default = ProductModel;
/*
  name
  description
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
