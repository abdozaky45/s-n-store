import {Schema , model} from "mongoose";
import ICategory from "./Icategory";
import { ImageSchema, NotRequiredBoolean,RefType,RequiredBoolean,RequiredBooleanDefaultTrue,RequiredNumber,RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
const CategorySchema = new Schema<ICategory>({
    categoryName: {
      ar: RequiredString,
      en: RequiredString,
    },
    isNewArrival:RequiredBooleanDefaultTrue,
    isOnSale:NotRequiredBoolean,
    subCategories: {
      type: [Schema.Types.ObjectId],
      ref: SchemaTypesReference.SubCategory,
      default: []
    },
    image:ImageSchema,
    createdBy:RefType(SchemaTypesReference.User,true),
    createdAt: RequiredNumber,
    isDeleted:NotRequiredBoolean
});
const CategoryModel = model(SchemaTypesReference.Category,CategorySchema);
export default CategoryModel;