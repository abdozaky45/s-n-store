"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schemas_1 = require("../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const GroupSizeSchema = new mongoose_1.default.Schema({
    name: Schemas_1.RequiredString
}, {
    id: false
});
const GroupSizeModel = mongoose_1.default.model(SchemaTypesReference_1.default.GroupSize, GroupSizeSchema);
exports.default = GroupSizeModel;
