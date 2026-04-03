"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateShippingByIdUser = exports.validateShippingByIdAdmin = exports.updateShipping = exports.createShipping = void 0;
const joi_1 = __importDefault(require("joi"));
const baseSchema_1 = require("../baseSchema");
exports.createShipping = baseSchema_1.baseSchema.concat(joi_1.default
    .object({
    name: joi_1.default.object({
        ar: joi_1.default.string().required(),
        en: joi_1.default.string().required(),
    }).required(),
    cost: joi_1.default.number().required(),
})
    .required()).required();
exports.updateShipping = baseSchema_1.baseSchema.concat(joi_1.default
    .object({
    _id: joi_1.default.string().required(),
    name: joi_1.default.object({
        ar: joi_1.default.string().required(),
        en: joi_1.default.string().required(),
    }).optional(),
    cost: joi_1.default.number().optional(),
})
    .required()).required();
exports.validateShippingByIdAdmin = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required(),
})).required();
exports.validateShippingByIdUser = joi_1.default.object({
    _id: joi_1.default.string().required(),
}).required();
