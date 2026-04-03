"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeroSectionById = exports.getAllHeroSections = exports.deleteHeroSection = exports.updateOneHeroSection = exports.createHeroSection = void 0;
const CategoryService_1 = require("../../Service/Category/CategoryService");
const ImageSliderService_1 = require("../../Service/ImageSlider/ImageSliderService");
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const Error_1 = __importDefault(require("../../Utils/Error"));
exports.createHeroSection = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { images } = req.body;
    const imageSliderData = {
        images: {
            image1: {
                mediaUrl: images.image1.imageUrl,
                mediaId: (0, CategoryService_1.extractMediaId)(images.image1.imageUrl),
                mediaType: images.image1.imageType,
            },
            image2: {
                mediaUrl: images.image2.imageUrl,
                mediaId: (0, CategoryService_1.extractMediaId)(images.image2.imageUrl),
                mediaType: images.image2.imageType,
            }
        },
        createdBy: req.body.currentUser.userInfo._id,
    };
    const media = await (0, ImageSliderService_1.createImageSlider)(imageSliderData);
    return res.json(new ErrorHandling_1.ApiResponse(200, { media }, SuccessMessages_1.default.IMAGE_SLIDER_CREATED));
});
exports.updateOneHeroSection = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { images } = req.body;
    const { id } = req.params;
    const updatedImageSliderData = {
        images: {
            image1: {
                mediaUrl: images.image1.imageUrl,
                mediaId: (0, CategoryService_1.extractMediaId)(images.image1.imageUrl),
                mediaType: images.image1.imageType,
            },
            image2: {
                mediaUrl: images.image2.imageUrl,
                mediaId: (0, CategoryService_1.extractMediaId)(images.image2.imageUrl),
                mediaType: images.image2.imageType,
            },
        },
        createdBy: req.body.currentUser.userInfo._id,
    };
    const media = await (0, ImageSliderService_1.updateHeroSection)(updatedImageSliderData, id);
    if (!media)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.INVALID_UPDATE_HERO_SECTION);
    return res.json(new ErrorHandling_1.ApiResponse(200, { media }, SuccessMessages_1.default.IMAGE_UPDATED));
});
exports.deleteHeroSection = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const media = await (0, ImageSliderService_1.findMediaId)(id);
    if (!media)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.IMAGE_NOT_FOUND);
    const images = [media.images.image1, media.images.image2];
    await Promise.all(images
        .filter((image) => image?.mediaId)
        .map((image) => (0, CategoryService_1.deletePresignedURL)(image.mediaId)));
    await (0, ImageSliderService_1.deleteImageSlider)(id);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.IMAGE_DELETED));
});
exports.getAllHeroSections = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const imageSlider = await (0, ImageSliderService_1.getAllImageSlider)();
    return res.json(new ErrorHandling_1.ApiResponse(200, { imageSlider }, SuccessMessages_1.default.IMAGE_SLIDER_FETCHED));
});
exports.getHeroSectionById = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const imageSlider = await (0, ImageSliderService_1.findMediaId)(req.params.id);
    if (!imageSlider)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.IMAGE_NOT_FOUND);
    return res.json(new ErrorHandling_1.ApiResponse(200, { imageSlider }, SuccessMessages_1.default.IMAGE_SLIDER_FETCHED));
});
