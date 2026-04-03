"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const VariantSchema = new mongoose_1.Schema({
    product: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.Product, true),
    size: Schemas_1.RequiredDefaultStringSize,
    color: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.Color, true),
    quantity: Schemas_1.RequiredNumber,
});
VariantSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.product;
        return ret;
    },
});
VariantSchema.index({ product: 1, size: 1, color: 1 }, { unique: true });
const VariantModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.Variant, VariantSchema);
exports.default = VariantModel;
