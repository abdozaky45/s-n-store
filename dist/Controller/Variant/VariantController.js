"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVariantController = exports.updateVariantQuantityController = exports.getVariantByIdController = exports.getVariantsByProductController = exports.createVariantController = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const Error_1 = __importDefault(require("../../Utils/Error"));
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const VariantService_1 = require("../../Service/Variant/VariantService");
const ProductService_1 = require("../../Service/Product/ProductService");
exports.createVariantController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { productId, size, color, quantity } = req.body;
    const product = await (0, ProductService_1.getAdminProductById)(productId);
    if (!product)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.PRODUCT_NOT_FOUND);
    const variant = await (0, VariantService_1.createVariant)({ product: productId, size, color, quantity });
    return res.status(201).json(new ErrorHandling_1.ApiResponse(201, { variant }, SuccessMessages_1.default.VARIANT_CREATED));
});
exports.getVariantsByProductController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const variants = await (0, VariantService_1.getVariantsByProduct)(productId);
    return res.json(new ErrorHandling_1.ApiResponse(200, { variants }, SuccessMessages_1.default.VARIANT_FOUND));
});
exports.getVariantByIdController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { variantId } = req.params;
    const variant = await (0, VariantService_1.getVariantById)(variantId);
    if (!variant)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.VARIANT_NOT_FOUND);
    return res.json(new ErrorHandling_1.ApiResponse(200, { variant }, SuccessMessages_1.default.VARIANT_FOUND));
});
exports.updateVariantQuantityController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { variantId } = req.params;
    const { quantity, productId } = req.body;
    const variant = await (0, VariantService_1.getVariantById)(variantId);
    if (!variant)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.VARIANT_NOT_FOUND);
    const updated = await (0, VariantService_1.updateVariantQuantity)(variantId, quantity, productId);
    return res.json(new ErrorHandling_1.ApiResponse(200, { variant: updated }, SuccessMessages_1.default.VARIANT_UPDATED));
});
exports.deleteVariantController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { variantId } = req.params;
    const { productId } = req.body;
    const variant = await (0, VariantService_1.getVariantById)(variantId);
    if (!variant)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.VARIANT_NOT_FOUND);
    await (0, VariantService_1.deleteVariant)(variantId, productId);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.VARIANT_DELETED));
});
