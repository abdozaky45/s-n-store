import { IOffer } from "../../Model/Offers/IOffers";
import { Types } from "mongoose";
import OfferModel from "../../Model/Offers/Offers";

export const createOffer = async (offerData: IOffer) => {
  const offer = await OfferModel.create(offerData);
  return offer;
};

export const getAllOffers = async () => {
  const offers = await OfferModel.find().select("-__v");
  return offers;
};

export const getActiveOffers = async () => {
  const offers = await OfferModel.find({ isActive: true }).select("-__v");
  return offers;
};

export const getOfferById = async (_id: string | Types.ObjectId) => {
  const offer = await OfferModel.findById(_id).select("-__v");
  return offer;
};

export const updateOffer = async (_id: string | Types.ObjectId, offerData: Partial<IOffer>) => {
  const offer = await OfferModel.findByIdAndUpdate(_id, offerData, { new: true }).select("-__v");
  return offer;
};

export const deleteOffer = async (_id: string | Types.ObjectId) => {
  const offer = await OfferModel.findByIdAndDelete(_id);
  return offer;
};

export const toggleOffer = async (_id: string | Types.ObjectId, isActive: boolean) => {
  const offer = await OfferModel.findByIdAndUpdate(_id, { isActive }, { new: true }).select("-__v");
  return offer;
};