"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const OrderStatusType_1 = require("../../Utils/OrderStatusType");
const OrderSchema = new mongoose_1.Schema({
    orderNumber: Schemas_1.RequiredString,
    customer: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.Customer, true),
    shipping: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.Shipping, true),
    email: Schemas_1.NotRequiredString,
    products: [{
            _id: false,
            productId: { type: mongoose_1.Types.ObjectId, ref: SchemaTypesReference_1.default.Product, required: true },
            name: { ar: Schemas_1.RequiredString, en: Schemas_1.RequiredString },
            variantId: { type: mongoose_1.Types.ObjectId, ref: SchemaTypesReference_1.default.Variant, required: true },
            quantity: Schemas_1.RequiredNumber,
            size: Schemas_1.RequiredString,
            color: { type: mongoose_1.Types.ObjectId, ref: SchemaTypesReference_1.default.Color, required: true },
            itemPrice: Schemas_1.RequiredNumber,
            totalPrice: Schemas_1.RequiredNumber,
        }],
    subTotal: Schemas_1.RequiredNumber,
    shippingCost: Schemas_1.RequiredNumber,
    discount: { type: Number, default: 0 },
    totalAmount: Schemas_1.RequiredNumber,
    appliedOffer: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.Offer, false),
    freeShipping: Schemas_1.NotRequiredBoolean,
    status: (0, Schemas_1.EnumStringRequired)(OrderStatusType_1.orderStatusArray),
}, { timestamps: true });
exports.default = (0, mongoose_1.model)(SchemaTypesReference_1.default.Order, OrderSchema);
