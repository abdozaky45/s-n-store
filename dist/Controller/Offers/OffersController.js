"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleOfferController = exports.deleteOfferController = exports.updateOfferController = exports.getOfferByIdController = exports.getActiveOffersController = exports.getAllOffersController = exports.createOfferController = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const Error_1 = __importDefault(require("../../Utils/Error"));
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const OffersService_1 = require("../../Service/Offers/OffersService");
exports.createOfferController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { type, isActive, image, description, minOrderAmount, discountAmount } = req.body;
    const offerData = { type, isActive, image, description, minOrderAmount, discountAmount };
    const offer = await (0, OffersService_1.createOffer)(offerData);
    return res.status(201).json(new ErrorHandling_1.ApiResponse(201, { offer }, SuccessMessages_1.default.OFFER_CREATED));
});
exports.getAllOffersController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const offers = await (0, OffersService_1.getAllOffers)();
    return res.json(new ErrorHandling_1.ApiResponse(200, { offers }, SuccessMessages_1.default.OFFER_FOUND));
});
exports.getActiveOffersController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const offers = await (0, OffersService_1.getActiveOffers)();
    return res.json(new ErrorHandling_1.ApiResponse(200, { offers }, SuccessMessages_1.default.OFFER_FOUND));
});
exports.getOfferByIdController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { offerId } = req.params;
    const offer = await (0, OffersService_1.getOfferById)(offerId);
    if (!offer)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.OFFER_NOT_FOUND);
    return res.json(new ErrorHandling_1.ApiResponse(200, { offer }, SuccessMessages_1.default.OFFER_FOUND));
});
exports.updateOfferController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { offerId } = req.params;
    const offer = await (0, OffersService_1.getOfferById)(offerId);
    if (!offer)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.OFFER_NOT_FOUND);
    const updated = await (0, OffersService_1.updateOffer)(offerId, req.body);
    return res.json(new ErrorHandling_1.ApiResponse(200, { offer: updated }, SuccessMessages_1.default.OFFER_UPDATED));
});
exports.deleteOfferController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { offerId } = req.params;
    const offer = await (0, OffersService_1.getOfferById)(offerId);
    if (!offer)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.OFFER_NOT_FOUND);
    await (0, OffersService_1.deleteOffer)(offerId);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.OFFER_DELETED));
});
exports.toggleOfferController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { offerId } = req.params;
    const offer = await (0, OffersService_1.getOfferById)(offerId);
    if (!offer)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.OFFER_NOT_FOUND);
    const updated = await (0, OffersService_1.toggleOffer)(offerId, req.body.isActive);
    return res.json(new ErrorHandling_1.ApiResponse(200, { offer: updated }, SuccessMessages_1.default.OFFER_UPDATED));
});
