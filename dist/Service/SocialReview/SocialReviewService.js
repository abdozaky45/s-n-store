"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocialReviewById = exports.getAllSocialReviews = exports.deleteSocialReview = exports.updateSocialReview = exports.AddNewSocialReview = void 0;
const AwsController_1 = require("../../Controller/Aws/AwsController");
const SocialReviewModel_1 = __importDefault(require("../../Model/SocialReview/SocialReviewModel"));
const CategoryService_1 = require("../Category/CategoryService");
const AddNewSocialReview = async (socialReviewData) => {
    const review = await SocialReviewModel_1.default.create(socialReviewData);
    return review;
};
exports.AddNewSocialReview = AddNewSocialReview;
const updateSocialReview = async (reviewId, reviewData, imageUrl) => {
    let updated = false;
    if (imageUrl && imageUrl !== reviewData.image.mediaUrl) {
        const mediaId = (0, CategoryService_1.extractMediaId)(imageUrl);
        if (mediaId !== reviewData.image.mediaId) {
            reviewData.image.mediaUrl = imageUrl;
            reviewData.image.mediaId = mediaId;
            updated = true;
        }
    }
    return updated ? reviewData : null;
};
exports.updateSocialReview = updateSocialReview;
const deleteSocialReview = async (review) => {
    if (review.image?.mediaId) {
        await (0, AwsController_1.deleteImage)(review.image.mediaId);
    }
    const deletedReview = await SocialReviewModel_1.default.deleteOne({ _id: review._id });
    return deletedReview;
};
exports.deleteSocialReview = deleteSocialReview;
const getAllSocialReviews = async () => {
    const reviews = await SocialReviewModel_1.default.find({});
    return reviews;
};
exports.getAllSocialReviews = getAllSocialReviews;
const getSocialReviewById = async (reviewId) => {
    const review = await SocialReviewModel_1.default.findById(reviewId);
    return review;
};
exports.getSocialReviewById = getSocialReviewById;
