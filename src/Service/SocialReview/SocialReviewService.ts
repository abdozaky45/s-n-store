import { deleteImage } from "../../Controller/Aws/AwsController";
import ISocialReview from "../../Model/SocialReview/ISocialReviewModel";
import SocialReviewModel from "../../Model/SocialReview/SocialReviewModel";
import { Types } from "mongoose";
import { extractMediaId } from "../Category/CategoryService";

export const AddNewSocialReview = async (socialReviewData: ISocialReview) => {
    const review = await SocialReviewModel.create(socialReviewData);
    return review;
};
export const updateSocialReview = async (reviewId: string, reviewData:ISocialReview&{ _id: string | Types.ObjectId }, imageUrl?: string) => {
    let updated = false;
     if (imageUrl && imageUrl !== reviewData.image.mediaUrl) {
        const mediaId = extractMediaId(imageUrl);
        if (mediaId !== reviewData.image.mediaId) {
          reviewData.image.mediaUrl = imageUrl;
          reviewData.image.mediaId = mediaId;
          updated = true;
        }
      }
       return updated ? reviewData : null;
};
export const deleteSocialReview = async (review: ISocialReview&{ _id: string | Types.ObjectId }) => {
    if (review.image?.mediaId) {
        await deleteImage(review.image.mediaId);
    }
    const deletedReview = await SocialReviewModel.deleteOne({ _id: review._id });
    return deletedReview;
};
export const getAllSocialReviews = async () => {
    const reviews = await SocialReviewModel.find({})
    return reviews;
}
export const getSocialReviewById = async (reviewId: string) => {
    const review = await SocialReviewModel.findById(reviewId);
    return review;
}