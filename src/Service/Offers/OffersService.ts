import { IOffer } from "../../Model/Offers/IOffers";
import { Types } from "mongoose";
import OfferModel from "../../Model/Offers/Offers";
import { getOrSet, invalidatePattern, CacheKeys } from "../../Utils/Cache/cache";

// Any offer write busts every offer cache entry; offers are admin-managed and
// rarely change, so a blunt pattern invalidation is simplest and safe.
const bustOffers = () => invalidatePattern(CacheKeys.offersPattern);

export const createOffer = async (offerData: IOffer) => {
  const offer = await OfferModel.create(offerData);
  await bustOffers();
  return offer;
};

export const getAllOffers = async () => {
  return getOrSet(
    CacheKeys.offersAll,
    () => OfferModel.find().sort({ createdAt: -1 }).select("-__v"),
    900 // 15 min
  );
};

export const getActiveOffers = async () => {
  // Shown on first paint of the storefront — highest-value list to cache.
  return getOrSet(
    CacheKeys.offersActive,
    () => OfferModel.find({ isActive: true }).sort({ createdAt: -1 }).select("-__v"),
    900 // 15 min
  );
};

export const getOfferById = async (_id: string | Types.ObjectId) => {
  const offer = await OfferModel.findById(_id).select("-__v");
  return offer;
};

export const updateOffer = async (_id: string | Types.ObjectId, offerData: Partial<IOffer>) => {
  const offer = await OfferModel.findByIdAndUpdate(_id, offerData, { new: true }).select("-__v");
  await bustOffers();
  return offer;
};

export const deleteOffer = async (_id: string | Types.ObjectId) => {
  const offer = await OfferModel.findByIdAndDelete(_id);
  await bustOffers();
  return offer;
};

export const toggleOffer = async (_id: string | Types.ObjectId, isActive: boolean) => {
  const offer = await OfferModel.findByIdAndUpdate(_id, { isActive }, { new: true }).select("-__v");
  await bustOffers();
  return offer;
};