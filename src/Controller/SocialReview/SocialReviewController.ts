import { Request, Response } from "express";
import { ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import * as SocialReviewService from "../../Service/SocialReview/SocialReviewService";
import ErrorMessages from "../../Utils/Error";
import SuccessMessage from "../../Utils/SuccessMessages";
import ISocialReview from "../../Model/SocialReview/ISocialReviewModel";
import { extractMediaId } from "../../Service/Category/CategoryService";
export const createSocialReviewController = asyncHandler(
    async (req: Request, res: Response) => {
        const SocialReviewData: ISocialReview = {
            image: {
                mediaUrl: req.body.image.mediaUrl,
                mediaId: extractMediaId(req.body.image)
            },
            createdBy: req.body.currentUser.userInfo._id
        }
        const review = await SocialReviewService.AddNewSocialReview(SocialReviewData);
        return res.json(new ApiResponse(200, { review }, SuccessMessage.SOCIAL_REVIEW_CREATED));
    });
export const updateSocialReviewController = asyncHandler(
    async (req: Request, res: Response) => {
        const reviewId = req.params.id as string;
        const review = await SocialReviewService.getSocialReviewById(reviewId);
        if (!review) {
            return res.status(404).json(new ApiResponse(404, null, ErrorMessages.SOCIAL_REVIEW_NOT_FOUND));
        }
        const updatedReview = await SocialReviewService.updateSocialReview(reviewId, review, req.body.image?.mediaUrl);
        if (updatedReview) {
            await review.save();
            return res.json(
                new ApiResponse(
                    200,
                    { review: updatedReview },
                    SuccessMessage.SOCIAL_REVIEW_UPDATED
                )
            );
        }
        return res.json(
            new ApiResponse(
                200,
                {},
                SuccessMessage.SOCIAL_REVIEW_UPDATED_NO_CHANGES
            )
        );
    });
export const deleteSocialReviewController = asyncHandler(
    async (req: Request, res: Response) => {
        const reviewId = req.params.id as string;
        const review = await SocialReviewService.getSocialReviewById(reviewId);
        if (!review) {
            return res.status(404).json(new ApiResponse(404, null, ErrorMessages.SOCIAL_REVIEW_NOT_FOUND));
        }
        await SocialReviewService.deleteSocialReview(review);
        return res.json(new ApiResponse(200, null, SuccessMessage.SOCIAL_REVIEW_DELETED));
    }
);
export const getAllSocialReviewsController = asyncHandler(
    async (req: Request, res: Response) => {
        const reviews = await SocialReviewService.getAllSocialReviews();
        return res.json(new ApiResponse(200, { reviews }, SuccessMessage.SOCIAL_REVIEW_FOUND));
    }
);
export const getSocialReviewByIdController = asyncHandler(
    async (req: Request, res: Response) => {
        const reviewId = req.params.id as string;
        const review = await SocialReviewService.getSocialReviewById(reviewId);
        if (!review) {
            return res.status(404).json(new ApiResponse(404, null, ErrorMessages.SOCIAL_REVIEW_NOT_FOUND));
        }
        return res.json(new ApiResponse(200, { review }, SuccessMessage.SOCIAL_REVIEW_FOUND));
    }
);