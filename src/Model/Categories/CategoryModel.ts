import {Schema , model} from "mongoose";
import ICategory from "./Icategory";
import { ImageSchema, NotRequiredBoolean, NotRequiredString, RefType, RequiredNumber, RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
const CategorySchema = new Schema<ICategory>({
    categoryName: {
      ar: RequiredString,
      en: RequiredString,
    },
    description: {
      ar: NotRequiredString,
      en: NotRequiredString,
    },
    isNew:NotRequiredBoolean,
    image:ImageSchema,
    createdBy:RefType(SchemaTypesReference.User,true),
    createdAt:RequiredNumber,
    isDeleted:NotRequiredBoolean
});
const CategoryModel = model(SchemaTypesReference.Category,CategorySchema);
export default CategoryModel;