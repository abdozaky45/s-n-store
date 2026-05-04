import { Schema, model } from "mongoose";
import ICategory from "./Icategory";
import { ImageSchema, NotRequiredBoolean, RefType, RequiredBooleanDefaultTrue, RequiredNumber, RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
const CategorySchema = new Schema<ICategory>({
  name: {
    ar: RequiredString,
    en: RequiredString,
  },
  groupSize: RefType(SchemaTypesReference.GroupSize, true),
  image: ImageSchema,
  image_svg: RefType(SchemaTypesReference.CategoryIcon, false),
  createdBy: RefType(SchemaTypesReference.User, true),
  isDeleted: NotRequiredBoolean
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false
});
CategorySchema.virtual(SchemaTypesReference.SubCategory, {
  ref: SchemaTypesReference.SubCategory,
  localField: "_id",
  foreignField: SchemaTypesReference.Category,
  id: false,
}
);
CategorySchema.virtual(SchemaTypesReference.SizeCategory, {
  ref: SchemaTypesReference.SizeCategory,
  localField:SchemaTypesReference.GroupSize,      
  foreignField: SchemaTypesReference.GroupSize,    
  options: { sort: { order: 1 } }, 
});
const CategoryModel = model(SchemaTypesReference.Category, CategorySchema);
export default CategoryModel;