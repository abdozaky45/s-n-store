import { Schema, model } from "mongoose";
import ICategoryIcon from "./ICategoryIcon";
import { RequiredString, RequiredUniqueString, RequiredBooleanDefaultTrue } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";

const CategoryIconSchema = new Schema<ICategoryIcon>(
  {
    key: RequiredUniqueString,
    svg: RequiredString,
    isActive: RequiredBooleanDefaultTrue,
  },
  { timestamps: true }
);

const CategoryIconModel = model(SchemaTypesReference.CategoryIcon, CategoryIconSchema);
export default CategoryIconModel;
