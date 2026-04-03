"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const TokenSchema = new mongoose_1.Schema({
    accessToken: Schemas_1.RequiredString,
    user: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.User, true),
    userAgent: Schemas_1.RequiredString,
    createdAt: Schemas_1.createdAtTokenModel,
    expiresAt: Schemas_1.expiresAtTokenModel,
});
const TokenModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.Token, TokenSchema);
exports.default = TokenModel;
