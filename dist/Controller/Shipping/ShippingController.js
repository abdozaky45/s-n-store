"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShippingById = exports.getAllShipping = exports.deleteShipping = exports.updateShipping = exports.createShipping = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const ShippingService_1 = __importDefault(require("../../Service/Shipping/ShippingService"));
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const Error_1 = __importDefault(require("../../Utils/Error"));
exports.createShipping = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const shippingData = {
        name: { ar: req.body.name.ar, en: req.body.name.en },
        cost: req.body.cost
    };
    const shipping = await ShippingService_1.default.createShipping(shippingData);
    return res.status(201).json(new ErrorHandling_1.ApiResponse(201, { shipping }, SuccessMessages_1.default.SHIPPING_CREATED));
});
exports.updateShipping = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const shippingData = {
        name: req.body.name ? { ar: req.body.name.ar, en: req.body.name.en } : undefined,
        cost: req.body.cost ? req.body.cost : undefined
    };
    console.log("shippingData", shippingData);
    console.log("req.params._id", req.params._id);
    const checkShipping = await ShippingService_1.default.getShippingById(req.params._id);
    if (!checkShipping) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.SHIPPING_NOT_FOUND);
    }
    const shipping = await ShippingService_1.default.updateShipping(req.params._id, shippingData);
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, { shipping }, SuccessMessages_1.default.SHIPPING_UPDATED));
});
exports.deleteShipping = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const shippingId = req.params._id;
    const checkShipping = await ShippingService_1.default.getShippingById(shippingId);
    if (!checkShipping) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.SHIPPING_NOT_FOUND);
    }
    await ShippingService_1.default.deleteShipping(shippingId);
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.SHIPPING_DELETED));
});
exports.getAllShipping = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const shipping = await ShippingService_1.default.getAllShipping();
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, { shipping }));
});
exports.getShippingById = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const shippingId = req.params._id;
    const shipping = await ShippingService_1.default.getShippingById(shippingId);
    if (!shipping) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.SHIPPING_NOT_FOUND);
    }
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, { shipping }));
});
