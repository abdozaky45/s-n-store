"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schemas_1 = require("../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const mongoose_1 = require("mongoose");
const ColorSchema = new mongoose_1.Schema({
    name: {
        ar: { type: String, required: true },
        en: { type: String, required: true },
    },
    hex: Schemas_1.RequiredString,
});
const ColorModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.Color, ColorSchema);
exports.default = ColorModel;
