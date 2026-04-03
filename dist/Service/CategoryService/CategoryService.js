"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = exports.deleteCategory = exports.prepareCategoryUpdates = exports.deletePresignedURL = exports.findCategoryById = exports.extractMediaId = exports.createCategory = void 0;
const CategoryModel_1 = __importDefault(require("../../Model/Categories/CategoryModel"));
const presignedUrl_1 = __importDefault(require("../Aws/S3_Bucket/presignedUrl"));
const createCategory = async ({ categoryName, description, mediaUrl, mediaId, createdBy, createdAt, }) => {
    const category = await CategoryModel_1.default.create({
        categoryName,
        isNewArrival: true,
        image: {
            mediaUrl,
            mediaId,
        },
        createdBy,
        createdAt,
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
    const category = await CategoryModel_1.default.findById(_id);
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
const prepareCategoryUpdates = async (category, categoryName, imageUrl) => {
    let updated = false;
    if (categoryName && (categoryName.ar || categoryName.en)) {
        category.categoryName = {
            ar: categoryName.ar ?? category.categoryName.ar,
            en: categoryName.en ?? category.categoryName.en,
        };
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
const deleteCategory = async (_id) => {
    const category = await CategoryModel_1.default.findByIdAndUpdate(_id, { isDeleted: true });
    return category;
};
exports.deleteCategory = deleteCategory;
const getAllCategories = async () => {
    const categories = await CategoryModel_1.default.find({ isDeleted: false }).select("-isDeleted -__v");
    return categories;
};
exports.getAllCategories = getAllCategories;
