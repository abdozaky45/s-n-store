"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const ShippingSchema = new mongoose_1.Schema({
    name: { ar: Schemas_1.RequiredString, en: Schemas_1.RequiredString },
    cost: Schemas_1.RequiredNumber,
});
const ShippingModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.Shipping, ShippingSchema);
exports.default = ShippingModel;
