import { Schema, model } from "mongoose";
import ISubCategory from "./ISubcategory";
import { ImageSchema, NotRequiredBoolean, NotRequiredString, RefType, RequiredNumber, RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
const SubCategorySchema = new Schema<ISubCategory>({
  name: {
    ar: RequiredString,
    en: RequiredString,
  },
  groupSize: RefType(SchemaTypesReference.GroupSize, true),
  category: RefType(SchemaTypesReference.Category, true),
  image: ImageSchema,
  createdBy: RefType(SchemaTypesReference.User, true),
  isDeleted: NotRequiredBoolean
}, {
  id: false
});
SubCategorySchema.virtual(SchemaTypesReference.SizeCategory, {
  ref: SchemaTypesReference.SizeCategory,
  localField: SchemaTypesReference.GroupSize,
  foreignField: SchemaTypesReference.GroupSize,
  options: { sort: { order: 1 } },
});
const SubCategoryModel = model(SchemaTypesReference.SubCategory, SubCategorySchema);
export default SubCategoryModel;