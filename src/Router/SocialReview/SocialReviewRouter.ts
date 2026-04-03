import { Router } from "express";
import * as SocialReviewController from "../../Controller/SocialReview/SocialReviewController";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as SocialReviewValidation from "../../Validation/SocialReview/SocialReviewValidation";
import { baseSchema } from "../../Validation/baseSchema";
const SocialReviewRouter = Router();
SocialReviewRouter.post(
    "/",
    Validation(SocialReviewValidation.socialReviewIdSchema),
    SocialReviewController.createSocialReviewController
);
SocialReviewRouter.get("/",SocialReviewController.getAllSocialReviewsController);
SocialReviewRouter.get(
    "/:_id",
    Validation(SocialReviewValidation.socialReviewIdSchema),
    SocialReviewController.getSocialReviewByIdController
);
SocialReviewRouter.patch(
    "/:_id",
    Validation(SocialReviewValidation.socialReviewIdSchema),
    SocialReviewController.updateSocialReviewController
);
SocialReviewRouter.delete(
    "/:_id",
    Validation(SocialReviewValidation.socialReviewIdSchema),
    SocialReviewController.deleteSocialReviewController
);

export default SocialReviewRouter;
