import {Router} from "express";
import * as SocialReviewController from "../../Controller/SocialReview/SocialReviewController";
const PublicSocialReviewRouter = Router();
PublicSocialReviewRouter.get("/",SocialReviewController.getAllSocialReviewsController);
export default PublicSocialReviewRouter;