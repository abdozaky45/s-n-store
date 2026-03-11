import { Router } from "express";
import categoryPublicRouter from "../Category/CategoryPublicRouter";
import ProductPublicRouter from "../Product/ProductPublicRouter";
import PublicImageSliderRouter from "../ImageSlider/PublicImageSliderRouter";
import subCategoryPublicRouter from "../SubCategory/SubCategoryPublicRouter";
const publicRouter = Router();
publicRouter.use("/category", categoryPublicRouter);
publicRouter.use("/sub-category", subCategoryPublicRouter);
publicRouter.use("/product", ProductPublicRouter);
publicRouter.use("/hero-section", PublicImageSliderRouter)
export default publicRouter;
