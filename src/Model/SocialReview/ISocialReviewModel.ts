import { Types } from "mongoose";
interface SocialReviewImage {
    mediaUrl: string;
    mediaId: string;
}
export default interface ISocialReview {
    image: SocialReviewImage;
    createdBy: string | Types.ObjectId;

}
