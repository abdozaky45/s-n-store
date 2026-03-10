import {Schema , model} from "mongoose";
import ISubCategory from "./ISubcategory";
import { ImageSchema, NotRequiredBoolean, NotRequiredString, RefType,RequiredNumber,RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
const SubCategorySchema = new Schema<ISubCategory>({
    subCategoryName: {
      ar: RequiredString,
      en: RequiredString,
    },
    description: {
      ar: NotRequiredString,
      en: NotRequiredString,
    },
    isNewArrival:NotRequiredBoolean,
    isOnSale:NotRequiredBoolean,
    image:ImageSchema,
    createdBy:RefType(SchemaTypesReference.User,true),
    createdAt: RequiredNumber,
    isDeleted:NotRequiredBoolean
});
const SubCategoryModel = model(SchemaTypesReference.SubCategory,SubCategorySchema);
export default SubCategoryModel;