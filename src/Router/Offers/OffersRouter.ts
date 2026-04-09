import { Router } from "express";
import * as OfferController from "../../Controller/Offers/OffersController";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as OffersValidation from "../../Validation/Offers/OffersValidation";
const OfferRouter = Router();
OfferRouter.post("/", Validation(OffersValidation.createOfferValidation), OfferController.createOfferController);
OfferRouter.get("/", OfferController.getAllOffersController);
OfferRouter.get("/:offerId", Validation(OffersValidation.offerIdValidation), OfferController.getOfferByIdController);
OfferRouter.patch("/:offerId", Validation(OffersValidation.updateOfferValidation), OfferController.updateOfferController);
OfferRouter.patch("/toggle/:offerId", Validation(OffersValidation.toggleOfferValidation), OfferController.toggleOfferController);
OfferRouter.delete("/:offerId", Validation(OffersValidation.offerIdValidation), OfferController.deleteOfferController);

export default OfferRouter;