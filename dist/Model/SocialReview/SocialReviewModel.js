"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const SocialReviewSchema = new mongoose_1.Schema({
    image: Schemas_1.ImageSchema,
    createdBy: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.User, true),
}, { id: false });
const SocialReviewModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.SocialReview, SocialReviewSchema);
exports.default = SocialReviewModel;
