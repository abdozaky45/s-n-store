import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import SuccessMessage from "../../Utils/SuccessMessages";
import { IOffer } from "../../Model/Offers/IOffers";
import { createOffer, deleteOffer, getActiveOffers, getAllOffers, getOfferById, toggleOffer, updateOffer } from "../../Service/Offers/OffersService";

export const createOfferController = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, isActive, image, description, minOrderAmount, discountAmount } = req.body;
    const offerData: IOffer = { type, isActive, image, description, minOrderAmount, discountAmount };
    const offer = await createOffer(offerData);
    return res.status(201).json(new ApiResponse(201, { offer }, SuccessMessage.OFFER_CREATED));
  }
);

export const getAllOffersController = asyncHandler(
  async (req: Request, res: Response) => {
    const offers = await getAllOffers();
    return res.json(new ApiResponse(200, { offers }, SuccessMessage.OFFER_FOUND));
  }
);

export const getActiveOffersController = asyncHandler(
  async (req: Request, res: Response) => {
    const offers = await getActiveOffers();
    return res.json(new ApiResponse(200, { offers }, SuccessMessage.OFFER_FOUND));
  }
);

export const getOfferByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { offerId } = req.params as { offerId: string };
    const offer = await getOfferById(offerId);
    if (!offer) throw new ApiError(404, ErrorMessages.OFFER_NOT_FOUND);
    return res.json(new ApiResponse(200, { offer }, SuccessMessage.OFFER_FOUND));
  }
);

export const updateOfferController = asyncHandler(
  async (req: Request, res: Response) => {
    const { offerId } = req.params as { offerId: string };
    const offer = await getOfferById(offerId);
    if (!offer) throw new ApiError(404, ErrorMessages.OFFER_NOT_FOUND);
    const updated = await updateOffer(offerId, req.body);
    return res.json(new ApiResponse(200, { offer: updated }, SuccessMessage.OFFER_UPDATED));
  }
);

export const deleteOfferController = asyncHandler(
  async (req: Request, res: Response) => {
    const { offerId } = req.params as { offerId: string };
    const offer = await getOfferById(offerId);
    if (!offer) throw new ApiError(404, ErrorMessages.OFFER_NOT_FOUND);
    await deleteOffer(offerId);
    return res.json(new ApiResponse(200, {}, SuccessMessage.OFFER_DELETED));
  }
);

export const toggleOfferController = asyncHandler(
  async (req: Request, res: Response) => {
    const { offerId } = req.params as { offerId: string };
    const offer = await getOfferById(offerId);
    if (!offer) throw new ApiError(404, ErrorMessages.OFFER_NOT_FOUND);
    const updated = await toggleOffer(offerId, req.body.isActive);
    return res.json(new ApiResponse(200, { offer: updated }, SuccessMessage.OFFER_UPDATED));
  }
);