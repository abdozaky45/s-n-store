import {Router} from "express";
import * as OfferController from "../../Controller/Offers/OffersController";
const PublicOfferRouter = Router();
PublicOfferRouter.get("/active", OfferController.getActiveOffersController);
export default PublicOfferRouter;
