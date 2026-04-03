"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocialReviewByIdController = exports.getAllSocialReviewsController = exports.deleteSocialReviewController = exports.updateSocialReviewController = exports.createSocialReviewController = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const SocialReviewService = __importStar(require("../../Service/SocialReview/SocialReviewService"));
const Error_1 = __importDefault(require("../../Utils/Error"));
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const CategoryService_1 = require("../../Service/Category/CategoryService");
exports.createSocialReviewController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const SocialReviewData = {
        image: {
            mediaUrl: req.body.image.mediaUrl,
            mediaId: (0, CategoryService_1.extractMediaId)(req.body.image)
        },
        createdBy: req.body.currentUser.userInfo._id
    };
    const review = await SocialReviewService.AddNewSocialReview(SocialReviewData);
    return res.json(new ErrorHandling_1.ApiResponse(200, { review }, SuccessMessages_1.default.SOCIAL_REVIEW_CREATED));
});
exports.updateSocialReviewController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const reviewId = req.params.id;
    const review = await SocialReviewService.getSocialReviewById(reviewId);
    if (!review) {
        return res.status(404).json(new ErrorHandling_1.ApiResponse(404, null, Error_1.default.SOCIAL_REVIEW_NOT_FOUND));
    }
    const updatedReview = await SocialReviewService.updateSocialReview(reviewId, review, req.body.image?.mediaUrl);
    if (updatedReview) {
        await review.save();
        return res.json(new ErrorHandling_1.ApiResponse(200, { review: updatedReview }, SuccessMessages_1.default.SOCIAL_REVIEW_UPDATED));
    }
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.SOCIAL_REVIEW_UPDATED_NO_CHANGES));
});
exports.deleteSocialReviewController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const reviewId = req.params.id;
    const review = await SocialReviewService.getSocialReviewById(reviewId);
    if (!review) {
        return res.status(404).json(new ErrorHandling_1.ApiResponse(404, null, Error_1.default.SOCIAL_REVIEW_NOT_FOUND));
    }
    await SocialReviewService.deleteSocialReview(review);
    return res.json(new ErrorHandling_1.ApiResponse(200, null, SuccessMessages_1.default.SOCIAL_REVIEW_DELETED));
});
exports.getAllSocialReviewsController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const reviews = await SocialReviewService.getAllSocialReviews();
    return res.json(new ErrorHandling_1.ApiResponse(200, { reviews }, SuccessMessages_1.default.SOCIAL_REVIEW_FOUND));
});
exports.getSocialReviewByIdController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const reviewId = req.params.id;
    const review = await SocialReviewService.getSocialReviewById(reviewId);
    if (!review) {
        return res.status(404).json(new ErrorHandling_1.ApiResponse(404, null, Error_1.default.SOCIAL_REVIEW_NOT_FOUND));
    }
    return res.json(new ErrorHandling_1.ApiResponse(200, { review }, SuccessMessages_1.default.SOCIAL_REVIEW_FOUND));
});
