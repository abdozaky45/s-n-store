import { Schema, model } from "mongoose";
import { RefType, RequiredDefaultStringSize, RequiredMinNumber } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import IVariant from "./IVariantModel";
const VariantSchema = new Schema<IVariant>({
  product: RefType(SchemaTypesReference.Product, true),
  size: RequiredDefaultStringSize,
  color: RefType(SchemaTypesReference.Color, false),
  quantity: RequiredMinNumber,
  // Display order copied from SizeCategory.order so variants render S,M,L,XL…
  // Unknown/ungrouped sizes default to 9999 (sorted last).
  order: { type: Number, default: 9999 },
});
VariantSchema.set("toJSON", {
  transform: (doc, ret) => {
  delete (ret as any).product;
    return ret;
  },
});
VariantSchema.index({ product: 1, size: 1, color: 1 }, { unique: true });
const VariantModel = model(SchemaTypesReference.Variant, VariantSchema);
export default VariantModel;