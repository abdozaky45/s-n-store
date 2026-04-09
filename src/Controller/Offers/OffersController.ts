import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import SuccessMessage from "../../Utils/SuccessMessages";
import { IOffer } from "../../Model/Offers/IOffers";
import * as OfferService from "../../Service/Offers/OffersService";
import { extractMediaId } from "../../Shared/MediaServiceShared";
import { deleteImage } from "../Aws/AwsController";

export const createOfferController = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, isActive, image, description, minOrderAmount, discountAmount } = req.body;
    const offerData: IOffer = {
      type,
      isActive,
      image:{
        mediaUrl: image,
        mediaId:extractMediaId(image)
      },
      description,
      minOrderAmount,
      discountAmount
    };
    const offer = await OfferService.createOffer(offerData);
    return res.status(201).json(new ApiResponse(201, { offer }, SuccessMessage.OFFER_CREATED));
  }
);

export const getAllOffersController = asyncHandler(
  async (req: Request, res: Response) => {
    const offers = await OfferService.getAllOffers();
    return res.json(new ApiResponse(200, { offers }, SuccessMessage.OFFER_FOUND));
  }
);

export const getActiveOffersController = asyncHandler(
  async (req: Request, res: Response) => {
    const offers = await OfferService.getActiveOffers();
    return res.json(new ApiResponse(200, { offers }, SuccessMessage.OFFER_FOUND));
  }
);

export const getOfferByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { offerId } = req.params as { offerId: string };
    const offer = await OfferService.getOfferById(offerId);
    if (!offer) throw new ApiError(404, ErrorMessages.OFFER_NOT_FOUND);
    return res.json(new ApiResponse(200, { offer }, SuccessMessage.OFFER_FOUND));
  }
);

export const updateOfferController = asyncHandler(
  async (req: Request, res: Response) => {
    const { offerId } = req.params as { offerId: string };

    const offer = await OfferService.getOfferById(offerId);
    if (!offer) throw new ApiError(404, ErrorMessages.OFFER_NOT_FOUND);

    if (req.body.image && offer.image?.mediaId) {
      await deleteImage(offer.image.mediaId);
    }

    const allowedFields: (keyof IOffer)[] = [
      'type', 'isActive', 'description', 'minOrderAmount', 'discountAmount'
    ];
    const updateData = allowedFields.reduce((acc, field) => {
      if (req.body[field] !== undefined) acc[field] = req.body[field];
      return acc;
    }, {} as Partial<IOffer>);

    if (req.body.image) {
      updateData.image = {
        mediaUrl: req.body.image,
        mediaId: extractMediaId(req.body.image),
      };
    }
    const updated = await OfferService.updateOffer(offerId, updateData);
    return res.json(new ApiResponse(200, { offer: updated }, SuccessMessage.OFFER_UPDATED));
  }
);

export const deleteOfferController = asyncHandler(
  async (req: Request, res: Response) => {
    const { offerId } = req.params as { offerId: string };
    const offer = await OfferService.getOfferById(offerId);
    if (!offer) throw new ApiError(404, ErrorMessages.OFFER_NOT_FOUND);
    if (offer.image.mediaId) {
    await deleteImage(offer.image.mediaId);
  }
    await OfferService.deleteOffer(offerId);
    return res.json(new ApiResponse(200, {}, SuccessMessage.OFFER_DELETED));
  }
);

export const toggleOfferController = asyncHandler(
  async (req: Request, res: Response) => {
    const { offerId } = req.params as { offerId: string };
    const offer = await OfferService.getOfferById(offerId);
    if (!offer) throw new ApiError(404, ErrorMessages.OFFER_NOT_FOUND);
    const updated = await OfferService.toggleOffer(offerId, req.body.isActive);
    return res.json(new ApiResponse(200, { offer: updated }, SuccessMessage.OFFER_UPDATED));
  }
);