"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleOfferValidation = exports.offerIdValidation = exports.updateOfferValidation = exports.createOfferValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const baseSchema_1 = require("../baseSchema");
const OfferType_1 = require("../../Utils/OfferType");
exports.createOfferValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    type: joi_1.default.string().valid(...OfferType_1.offerTypeArray).required(),
    isActive: joi_1.default.boolean().required(),
    image: joi_1.default.object({
        mediaUrl: joi_1.default.string().required(),
        mediaId: joi_1.default.string().required(),
    }).required(),
    description: joi_1.default.object({
        ar: joi_1.default.string().required(),
        en: joi_1.default.string().required(),
    }).required(),
    minOrderAmount: joi_1.default.number().required(),
    discountAmount: joi_1.default.number().optional(),
}).required());
exports.updateOfferValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    offerId: joi_1.default.string().required(),
    type: joi_1.default.string().valid(...OfferType_1.offerTypeArray).optional(),
    isActive: joi_1.default.boolean().optional(),
    image: joi_1.default.object({
        mediaUrl: joi_1.default.string().required(),
        mediaId: joi_1.default.string().required(),
    }).optional(),
    description: joi_1.default.object({
        ar: joi_1.default.string().optional(),
        en: joi_1.default.string().optional(),
    }).optional(),
    minOrderAmount: joi_1.default.number().optional(),
    discountAmount: joi_1.default.number().optional(),
}).required());
exports.offerIdValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    offerId: joi_1.default.string().required(),
}).required());
exports.toggleOfferValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    offerId: joi_1.default.string().required(),
    isActive: joi_1.default.boolean().required(),
}).required());
