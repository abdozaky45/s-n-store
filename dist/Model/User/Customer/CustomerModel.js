"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../../Utils/Schemas/SchemaTypesReference"));
const customerSchema = new mongoose_1.Schema({
    phone: Schemas_1.RequiredUniqueString
}, { _id: false });
const CustomerModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.Customer, customerSchema);
exports.default = CustomerModel;
