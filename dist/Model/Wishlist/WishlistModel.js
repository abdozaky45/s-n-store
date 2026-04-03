"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const Schemas_1 = require("../../Utils/Schemas");
const WishlistSchema = new mongoose_1.Schema({
    customer: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.Customer, true),
    product: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.Product, true),
    createdAt: Schemas_1.RequiredNumber,
});
const WishListModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.Wishlist, WishlistSchema);
exports.default = WishListModel;
