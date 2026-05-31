import mongoose from "mongoose";
import { IGroupSize } from "./IGroupSize";
import { RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";

const GroupSizeSchema = new mongoose.Schema<IGroupSize>({
    name:RequiredString
},{
    id: false,
    timestamps: true
});
const GroupSizeModel = mongoose.model(SchemaTypesReference.GroupSize, GroupSizeSchema);
export default GroupSizeModel;