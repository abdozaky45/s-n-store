import { Router } from "express";
import categoryPublicRouter from "../Category/CategoryPublicRouter";
import ProductPublicRouter from "../Product/ProductPublicRouter";
import PublicImageSliderRouter from "../ImageSlider/PublicImageSliderRouter";
import subCategoryPublicRouter from "../SubCategory/SubCategoryPublicRouter";
import PublicColorRouter from "../Color/PublicColorRouter";
import RouterEnum from "../../Utils/Routes";
import wishlistPublicRouter from "../Wishlist/WishlistPublicRouter";
import PublicOfferRouter from "../Offers/OffersPublicRouter";
import customerInfoRouter from "../User/CustomerInfoRouter";
import CustomerRouter from "../User/CustomerRouter";
import PublicShippingRouter from "../Shipping/PublicShippingRouter";
import PublicOrderRouter from "../Order/PublicOrderRouter";
import PublicSocialReviewRouter from "../SocialReview/PublicSocialReviewRouter";
import { sendEmail } from "../../Utils/Nodemailer/SendEmail";
const publicRouter = Router();
publicRouter.use(`/${RouterEnum.customer}`,CustomerRouter );
publicRouter.use(`/${RouterEnum.customerInfo}`, customerInfoRouter);
publicRouter.use(`/${RouterEnum.category}`, categoryPublicRouter);
publicRouter.use(`/${RouterEnum.subCategory}`, subCategoryPublicRouter);
publicRouter.use(`/${RouterEnum.product}`, ProductPublicRouter);
publicRouter.use(`/${RouterEnum.color}`, PublicColorRouter);
publicRouter.use(`/${RouterEnum.imageSlider}`, PublicImageSliderRouter);
publicRouter.use(`/${RouterEnum.shipping}`,PublicShippingRouter)
publicRouter.use(`/${RouterEnum.wishlist}`, wishlistPublicRouter);
publicRouter.use(`/${RouterEnum.offers}`, PublicOfferRouter);
publicRouter.use(`/${RouterEnum.order}`, PublicOrderRouter);
publicRouter.use(`/${RouterEnum.socialReview}`, PublicSocialReviewRouter);
publicRouter.post("/email", async (req, res) => {
   const {to , html} = req.body;
   sendEmail({
    to,
    subject:"Test Email from S&N LANGIRE",
    html
   })
   return res.json("Email sent successfully");
});
export default publicRouter;