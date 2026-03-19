import { RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import IColor from "./IColorModel";
import { Schema, model } from "mongoose";
const ColorSchema = new Schema<IColor>({
    name: {
        ar: { type: String, required: true },
        en: { type: String, required: true },
    },
    hex:RequiredString,
});
const ColorModel = model(SchemaTypesReference.Color, ColorSchema);
export default ColorModel;