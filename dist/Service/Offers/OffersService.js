"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleOffer = exports.deleteOffer = exports.updateOffer = exports.getOfferById = exports.getActiveOffers = exports.getAllOffers = exports.createOffer = void 0;
const Offers_1 = __importDefault(require("../../Model/Offers/Offers"));
const createOffer = async (offerData) => {
    const offer = await Offers_1.default.create(offerData);
    return offer;
};
exports.createOffer = createOffer;
const getAllOffers = async () => {
    const offers = await Offers_1.default.find().select("-__v");
    return offers;
};
exports.getAllOffers = getAllOffers;
const getActiveOffers = async () => {
    const offers = await Offers_1.default.find({ isActive: true }).select("-__v");
    return offers;
};
exports.getActiveOffers = getActiveOffers;
const getOfferById = async (_id) => {
    const offer = await Offers_1.default.findById(_id).select("-__v");
    return offer;
};
exports.getOfferById = getOfferById;
const updateOffer = async (_id, offerData) => {
    const offer = await Offers_1.default.findByIdAndUpdate(_id, offerData, { new: true }).select("-__v");
    return offer;
};
exports.updateOffer = updateOffer;
const deleteOffer = async (_id) => {
    const offer = await Offers_1.default.findByIdAndDelete(_id);
    return offer;
};
exports.deleteOffer = deleteOffer;
const toggleOffer = async (_id, isActive) => {
    const offer = await Offers_1.default.findByIdAndUpdate(_id, { isActive }, { new: true }).select("-__v");
    return offer;
};
exports.toggleOffer = toggleOffer;
