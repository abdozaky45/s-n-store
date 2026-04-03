"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardDeleteCategory = exports.findAllDeletedCategories = exports.getAllCategories = exports.restoreCategory = exports.softDeleteCategory = exports.prepareCategoryUpdates = exports.deletePresignedURL = exports.findCategoryById = exports.extractMediaId = exports.createCategory = void 0;
const CategoryModel_1 = __importDefault(require("../../Model/Category/CategoryModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const presignedUrl_1 = __importDefault(require("../Aws/S3_Bucket/presignedUrl"));
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const SubCategoryModel_1 = __importDefault(require("../../Model/SubCategory/SubCategoryModel"));
const ProductModel_1 = __importDefault(require("../../Model/Product/ProductModel"));
const VariantModel_1 = __importDefault(require("../../Model/Variant/VariantModel"));
const AwsController_1 = require("../../Controller/Aws/AwsController");
const createCategory = async ({ name, groupSize, mediaUrl, mediaId, createdBy, }) => {
    const category = await CategoryModel_1.default.create({
        name,
        groupSize,
        image: {
            mediaUrl,
            mediaId,
        },
        createdBy,
    });
    return category;
};
exports.createCategory = createCategory;
const extractMediaId = (imageUrl) => {
    if (!imageUrl.includes("amazonaws.com/")) {
        return "Invalid image url";
    }
    const mediaId = imageUrl.split("amazonaws.com/")[1];
    return mediaId;
};
exports.extractMediaId = extractMediaId;
const findCategoryById = async (_id) => {
    const category = await CategoryModel_1.default.findById(_id)
        .populate(SchemaTypesReference_1.default.SubCategory)
        .populate({
        path: SchemaTypesReference_1.default.SizeCategory,
        select: 'size order -_id',
    })
        .select("-__v");
    return category;
};
exports.findCategoryById = findCategoryById;
const deletePresignedURL = async (fileName) => {
    const aws_s3_service = new presignedUrl_1.default();
    const deleteImage = await aws_s3_service.deletePresignedUrl({
        bucket: process.env.AWS_BUCKET_NAME,
        key: fileName,
    });
    return deleteImage;
};
exports.deletePresignedURL = deletePresignedURL;
const prepareCategoryUpdates = async (category, groupSize, name, imageUrl) => {
    let updated = false;
    if (name && (name.ar || name.en)) {
        category.name = {
            ar: name.ar ?? category.name.ar,
            en: name.en ?? category.name.en,
        };
        updated = true;
    }
    if (groupSize && groupSize.toString() !== category.groupSize.toString()) {
        category.groupSize = groupSize;
        updated = true;
    }
    if (imageUrl && imageUrl !== category.image.mediaUrl) {
        const mediaId = (0, exports.extractMediaId)(imageUrl);
        if (mediaId !== category.image.mediaId) {
            category.image.mediaUrl = imageUrl;
            category.image.mediaId = mediaId;
            updated = true;
        }
    }
    return updated ? category : null;
};
exports.prepareCategoryUpdates = prepareCategoryUpdates;
const softDeleteCategory = async (_id) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await CategoryModel_1.default.findByIdAndUpdate(_id, { isDeleted: true }, { session });
        await SubCategoryModel_1.default.updateMany({ category: _id }, { isDeleted: true }, { session });
        await ProductModel_1.default.updateMany({ category: _id }, { isDeleted: true }, { session });
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
exports.softDeleteCategory = softDeleteCategory;
const restoreCategory = async (_id) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await CategoryModel_1.default.findByIdAndUpdate(_id, { isDeleted: false }, { session });
        await SubCategoryModel_1.default.updateMany({ category: _id }, { isDeleted: false }, { session });
        await ProductModel_1.default.updateMany({ category: _id }, { isDeleted: false }, { session });
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
exports.restoreCategory = restoreCategory;
const getAllCategories = async () => {
    const categories = await CategoryModel_1.default.find({ isDeleted: false })
        .populate(SchemaTypesReference_1.default.SubCategory).select("-isDeleted -__v");
    return categories;
};
exports.getAllCategories = getAllCategories;
const findAllDeletedCategories = async () => {
    const categories = await CategoryModel_1.default.find({ isDeleted: true }).populate(SchemaTypesReference_1.default.SubCategory).select("-isDeleted -__v");
    return categories;
};
exports.findAllDeletedCategories = findAllDeletedCategories;
const hardDeleteCategory = async (_id) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const products = await ProductModel_1.default.find({ category: _id }).select("_id defaultImage albumImages sizeChartImage");
        const subCategories = await SubCategoryModel_1.default.find({ category: _id }).select("_id image");
        const category = await CategoryModel_1.default.findById(_id).select("image");
        if (category?.image?.mediaId) {
            await (0, AwsController_1.deleteImage)(category.image.mediaId);
        }
        for (const sub of subCategories) {
            if (sub.image?.mediaId) {
                await (0, AwsController_1.deleteImage)(sub.image.mediaId);
            }
        }
        for (const product of products) {
            await (0, AwsController_1.deleteProductImages)(product);
        }
        const productIds = products.map((p) => p._id);
        await VariantModel_1.default.deleteMany({ product: { $in: productIds } }, { session });
        await ProductModel_1.default.deleteMany({ category: _id }, { session });
        await SubCategoryModel_1.default.deleteMany({ category: _id }, { session });
        await CategoryModel_1.default.findByIdAndDelete(_id, { session });
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
exports.hardDeleteCategory = hardDeleteCategory;
