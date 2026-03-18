import {Schema , model} from "mongoose";
import ICategory from "./Icategory";
import { ImageSchema, NotRequiredBoolean,RefType,RequiredBooleanDefaultTrue,RequiredNumber,RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
const CategorySchema = new Schema<ICategory>({
    categoryName: {
      ar: RequiredString,
      en: RequiredString,
    },
    image:ImageSchema,
    createdBy:RefType(SchemaTypesReference.User,true),
    isDeleted:NotRequiredBoolean
},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});
CategorySchema.virtual(SchemaTypesReference.SubCategory,{
  ref: SchemaTypesReference.SubCategory,
  localField: "_id",
  foreignField:SchemaTypesReference.Category,
})
const CategoryModel = model(SchemaTypesReference.Category,CategorySchema);
export default CategoryModel;