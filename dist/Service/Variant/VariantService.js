"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVariant = exports.updateVariantQuantity = exports.getVariantById = exports.getVariantsByProduct = exports.createManyVariants = exports.createVariant = exports.updateProductSoldOutStatus = void 0;
const VariantModel_1 = __importDefault(require("../../Model/Variant/VariantModel"));
const ProductModel_1 = __importDefault(require("../../Model/Product/ProductModel"));
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const updateProductSoldOutStatus = async (productId) => {
    const hasStock = await VariantModel_1.default.exists({
        product: productId,
        quantity: { $gt: 0 },
    });
    await ProductModel_1.default.findByIdAndUpdate(productId, {
        isSoldOut: !hasStock,
    });
};
exports.updateProductSoldOutStatus = updateProductSoldOutStatus;
const createVariant = async (variantData) => {
    const variant = await VariantModel_1.default.create(variantData);
    await (0, exports.updateProductSoldOutStatus)(variantData.product.toString());
    return variant;
};
exports.createVariant = createVariant;
const createManyVariants = async (variants, session) => {
    const created = await VariantModel_1.default.insertMany(variants, { session });
    const productId = variants[0].product.toString();
    await (0, exports.updateProductSoldOutStatus)(productId);
    return created;
};
exports.createManyVariants = createManyVariants;
const getVariantsByProduct = async (productId) => {
    const variants = await VariantModel_1.default.find({ product: productId })
        .populate({ path: SchemaTypesReference_1.default.Color, select: "-__v" })
        .select("-__v");
    return variants;
};
exports.getVariantsByProduct = getVariantsByProduct;
const getVariantById = async (_id) => {
    const variant = await VariantModel_1.default.findById(_id)
        .populate({ path: SchemaTypesReference_1.default.Color, select: "-__v" })
        .select("-__v");
    return variant;
};
exports.getVariantById = getVariantById;
const updateVariantQuantity = async (_id, quantity, productId) => {
    const variant = await VariantModel_1.default.findByIdAndUpdate(_id, { quantity }, { new: true });
    await (0, exports.updateProductSoldOutStatus)(productId);
    return variant;
};
exports.updateVariantQuantity = updateVariantQuantity;
const deleteVariant = async (_id, productId) => {
    const variant = await VariantModel_1.default.findByIdAndDelete(_id);
    await (0, exports.updateProductSoldOutStatus)(productId);
    return variant;
};
exports.deleteVariant = deleteVariant;
