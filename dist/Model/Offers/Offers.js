"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../Utils/Schemas");
const OfferType_1 = require("../../Utils/OfferType");
const ProductModel_1 = require("../Product/ProductModel");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const offerSchema = new mongoose_1.Schema({
    type: (0, Schemas_1.EnumStringRequired)(OfferType_1.offerTypeArray),
    isActive: Schemas_1.RequiredBoolean,
    image: ProductModel_1.ImageSchema,
    description: {
        ar: Schemas_1.RequiredString,
        en: Schemas_1.RequiredString
    },
    discountAmount: Schemas_1.RequiredNumber,
    minOrderAmount: Schemas_1.RequiredNumber
});
const OfferModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.Offer, offerSchema);
exports.default = OfferModel;
