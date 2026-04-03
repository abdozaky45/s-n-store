"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOrdersValidation = exports.getAllOrdersValidation = exports.updateOrderStatusValidation = exports.customerIdValidation = exports.orderNumberValidation = exports.orderIdValidation = exports.createOrderValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const baseSchema_1 = require("../baseSchema");
const OrderStatusType_1 = require("../../Utils/OrderStatusType");
exports.createOrderValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    customer: joi_1.default.string().required(),
    shipping: joi_1.default.string().required(),
    products: joi_1.default.array().items(joi_1.default.object({
        productId: joi_1.default.string().required(),
        variantId: joi_1.default.string().required(),
        name: joi_1.default.string().required(),
        quantity: joi_1.default.number().min(1).required(),
        size: joi_1.default.string().required(),
        color: joi_1.default.string().required(),
        itemPrice: joi_1.default.number().required(),
    })).min(1).required(),
}).required());
exports.orderIdValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    orderId: joi_1.default.string().required(),
}).required());
exports.orderNumberValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    orderNumber: joi_1.default.string().required(),
}).required());
exports.customerIdValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    customerId: joi_1.default.string().required(),
}).required());
exports.updateOrderStatusValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    orderId: joi_1.default.string().required(),
    status: joi_1.default.string().valid(...OrderStatusType_1.orderStatusArray).required(),
}).required());
exports.getAllOrdersValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    status: joi_1.default.string().valid(...OrderStatusType_1.orderStatusArray).optional(),
    orderNumber: joi_1.default.string().optional(),
    page: joi_1.default.number().optional(),
}).required());
exports.getUserOrdersValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    customerId: joi_1.default.string().required(),
    page: joi_1.default.number().optional(),
    searchTerm: joi_1.default.string().optional(),
}).required());
// import joi from 'joi';
// import { orderStatusArray } from '../../Utils/OrderStatusType';
// import { baseSchema } from '../baseSchema';
// export const createOrderValidation = baseSchema.concat(
//     joi.object({
//         products: joi.array().items(
//             joi.object({
//                 productId: joi.string().required(),
//                 quantity: joi.number().required(),
//             })
//         ).required(),
//         userId: joi.string().required(),
//     }).required()
// );
// export const updateOrderStatusValidation = baseSchema.concat(
//     joi.object({
//         orderId: joi.string().required(),
//         status: joi.string().valid(...orderStatusArray).required(),
//     }).required()
// );
// export const getAllOrdersValidation = baseSchema.concat(
//     joi.object({
//         page: joi.number().required(),
//         status: joi.string().optional(),
//         orderId: joi.string().optional(),
//     }).required()
// );
// export const getOrderByIdValidation = baseSchema.concat(
//     joi.object({
//         orderId: joi.string().required(),
//     }).required()
// );
