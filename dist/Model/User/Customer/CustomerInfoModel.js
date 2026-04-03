"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../../Utils/Schemas/SchemaTypesReference"));
const customerInfoSchema = new mongoose_1.Schema({
    customer: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.Customer, true),
    country: Schemas_1.RequiredDefaultStringCity,
    firstName: Schemas_1.RequiredString,
    lastName: Schemas_1.RequiredString,
    address: Schemas_1.RequiredString,
    apartmentSuite: Schemas_1.NotRequiredString,
    shipping: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.Shipping, true),
    postalCode: Schemas_1.NotRequiredString,
    additionalPhone: Schemas_1.NotRequiredString,
}, { _id: true });
const CustomerInfoModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.CustomerInfo, customerInfoSchema);
exports.default = CustomerInfoModel;
