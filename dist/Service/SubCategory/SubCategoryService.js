"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardDeleteSubCategory = exports.restoreSubCategory = exports.findAllDeletedSubCategories = exports.getAllSubCategories = exports.softDeleteSubCategory = exports.prepareSubCategoryUpdates = exports.findSubCategoryById = exports.createSubCategory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const CategoryService_1 = require("../Category/CategoryService");
const SubCategoryModel_1 = __importDefault(require("../../Model/SubCategory/SubCategoryModel"));
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const ProductModel_1 = __importDefault(require("../../Model/Product/ProductModel"));
const VariantModel_1 = __importDefault(require("../../Model/Variant/VariantModel"));
const AwsController_1 = require("../../Controller/Aws/AwsController");
const createSubCategory = async ({ name, groupSize, category, mediaUrl, mediaId, createdBy, }) => {
    const SubCategory = await SubCategoryModel_1.default.create({
        name,
        groupSize,
        category,
        image: {
            mediaUrl,
            mediaId,
        },
        createdBy,
    });
    return SubCategory;
};
exports.createSubCategory = createSubCategory;
const findSubCategoryById = async (_id) => {
    return SubCategoryModel_1.default.findById(_id)
        .populate(SchemaTypesReference_1.default.Category)
        .populate({
        path: SchemaTypesReference_1.default.SizeCategory,
        select: 'size order -_id',
    })
        .select('-__v');
};
exports.findSubCategoryById = findSubCategoryById;
const prepareSubCategoryUpdates = async (subCategory, groupSize, name, category, imageUrl) => {
    let updated = false;
    if (category && category.toString() !== subCategory.category.toString()) {
        subCategory.category = category;
        updated = true;
    }
    if (groupSize && groupSize.toString() !== subCategory.groupSize.toString()) {
        subCategory.groupSize = groupSize;
        updated = true;
    }
    if (name && (name.ar || name.en)) {
        subCategory.name = {
            ar: name.ar ?? subCategory.name.ar,
            en: name.en ?? subCategory.name.en,
        };
        updated = true;
    }
    if (imageUrl && imageUrl !== subCategory.image.mediaUrl) {
        const mediaId = (0, CategoryService_1.extractMediaId)(imageUrl);
        if (mediaId !== subCategory.image.mediaId) {
            subCategory.image.mediaUrl = imageUrl;
            subCategory.image.mediaId = mediaId;
            updated = true;
        }
    }
    return updated ? subCategory : null;
};
exports.prepareSubCategoryUpdates = prepareSubCategoryUpdates;
const softDeleteSubCategory = async (_id) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await SubCategoryModel_1.default.findByIdAndUpdate(_id, { isDeleted: true }, { session });
        await ProductModel_1.default.updateMany({ subCategory: _id }, { isDeleted: true }, { session });
        await session.commitTransaction();
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.softDeleteSubCategory = softDeleteSubCategory;
const getAllSubCategories = async () => {
    const subCategories = await SubCategoryModel_1.default.find({ isDeleted: false }).populate(SchemaTypesReference_1.default.Category).select("-isDeleted -__v");
    return subCategories;
};
exports.getAllSubCategories = getAllSubCategories;
const findAllDeletedSubCategories = async () => {
    const subCategories = await SubCategoryModel_1.default.find({ isDeleted: true }).populate(SchemaTypesReference_1.default.Category).select("-isDeleted -__v");
    return subCategories;
};
exports.findAllDeletedSubCategories = findAllDeletedSubCategories;
const restoreSubCategory = async (_id) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await SubCategoryModel_1.default.findByIdAndUpdate(_id, { isDeleted: false }, { session });
        await ProductModel_1.default.updateMany({ subCategory: _id }, { isDeleted: false }, { session });
        await session.commitTransaction();
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.restoreSubCategory = restoreSubCategory;
const hardDeleteSubCategory = async (_id) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const products = await ProductModel_1.default.find({ subCategory: _id })
            .select("_id defaultImage albumImages sizeChartImage");
        const subCategory = await SubCategoryModel_1.default.findById(_id).select("image");
        if (subCategory?.image?.mediaId) {
            await (0, AwsController_1.deleteImage)(subCategory.image.mediaId);
        }
        for (const product of products) {
            await (0, AwsController_1.deleteProductImages)(product);
        }
        const productIds = products.map((p) => p._id);
        await VariantModel_1.default.deleteMany({ product: { $in: productIds } }, { session });
        await ProductModel_1.default.deleteMany({ subCategory: _id }, { session });
        await SubCategoryModel_1.default.findByIdAndDelete(_id, { session });
        await session.commitTransaction();
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.hardDeleteSubCategory = hardDeleteSubCategory;
