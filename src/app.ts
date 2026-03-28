import cors from "cors";
import express, { Application } from "express";
import { Request, Response, NextFunction } from "express";
import { globalErrorHandling } from "./Utils/ErrorHandling";
import RouterEnum from "./Utils/Routes";
import authenticationRouter from "./Router/Authentication/AuthRouter";
import {
  checkAuthority,
  checkRole,
} from "./middleware/AuthenticationMiddleware";
import { UserTypeEnum } from "./Utils/UserType";
import categoryRouter from "./Router/Category/CategoryRouter";
import publicRouter from "./Router/PublicRouters/PublicRouter";
import AwsRouter from "./Router/Aws/AwsRouter";
import ProductRouter from "./Router/Product/ProductRouter";
import imageSliderRouter from "./Router/ImageSlider/ImageSliderRouter";
import shippingRouter from "./Router/Shipping/ShippingRouter";
import { getCorsOptions } from "./config";
import subCategoryRouter from "./Router/SubCategory/SubCategoryRouter";
import SizeCategoryRouter from "./Router/SizeCategory/SizeCategoryRouter";
import ColorRouter from "./Router/Color/ColorRouter";
import VariantRouter from "./Router/Variant/VariantRouter";
import OfferRouter from "./Router/Offers/OffersRouter";
const app: Application = express();
app.use(express.json());
app.use(cors(getCorsOptions()));
app.options(/.*/, cors(getCorsOptions()));
app.use(express.urlencoded({ extended: true }));
app.get("/", async (_, res) => {
  return res.json("Hello world!");
});
app.use(`/${RouterEnum.authentication}`, authenticationRouter);
//app.use(`/${RouterEnum.public}`, enforcePublicApiRestrictions, blockScrapers, publicRouter);
app.use(`/${RouterEnum.public}`, publicRouter);
app.use(checkAuthority);
app.use(
  `/${RouterEnum.aws}`,
  checkRole([UserTypeEnum.ADMIN]),
  AwsRouter
);
app.use(
  `/${RouterEnum.category}`,
  checkRole([UserTypeEnum.ADMIN]),
  categoryRouter
);
app.use(
  `/${RouterEnum.subCategory}`,
  checkRole([UserTypeEnum.ADMIN]),
  subCategoryRouter
);
app.use(
  `/${RouterEnum.sizeCategory}`,
  checkRole([UserTypeEnum.ADMIN]),
  SizeCategoryRouter
);
app.use(
  `/${RouterEnum.imageSlider}`,
  checkRole([UserTypeEnum.ADMIN]),
  imageSliderRouter
);
app.use(
  `/${RouterEnum.product}`,
  checkRole([UserTypeEnum.ADMIN]),
  ProductRouter
);
app.use(
  `/${RouterEnum.variant}`,
  checkRole([UserTypeEnum.ADMIN]),
  VariantRouter
)
app.use(
  `/${RouterEnum.color}`,
  checkRole([UserTypeEnum.ADMIN]),
 ColorRouter
)
app.use(
  `/${RouterEnum.shipping}`,
  checkRole([UserTypeEnum.ADMIN,
  UserTypeEnum.USER]),
  shippingRouter
);
app.use(
  `/${RouterEnum.offers}`,
  checkRole([UserTypeEnum.ADMIN]),
  OfferRouter
);
// app.use(
//   `/${RouterEnum.order}`,
//   checkRole([UserTypeEnum.ADMIN,
//   UserTypeEnum.USER]), // fix
//   OrderRouter
// );
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  globalErrorHandling(error, req, res, next);
});
export { app };
