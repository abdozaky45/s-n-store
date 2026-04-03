"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialReviewIdSchema = exports.socialReviewInputSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const baseSchema_1 = require("../baseSchema");
exports.socialReviewInputSchema = baseSchema_1.baseSchema.concat(joi_1.default.object({
    image: joi_1.default.string().required()
})).required();
exports.socialReviewIdSchema = baseSchema_1.baseSchema.concat(joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required()
})).required();
