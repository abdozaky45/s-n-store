
import  * as ImageSliderService from "../../Service/ImageSlider/ImageSliderService";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import { Request, Response, NextFunction } from "express";
import SuccessMessage from "../../Utils/SuccessMessages";
import ErrorMessages from "../../Utils/Error";
import IImageSlider from "../../Model/ImageSlider/IImageSliderModel";
import { extractMediaId ,deletePresignedURL} from "../../Shared/MediaServiceShared";
export const createImageSliderSection = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { images } = req.body;
    const imageSliderData: IImageSlider = {
      images: {
        image1: {
          mediaUrl: images.image1.imageUrl,
          mediaId: extractMediaId(images.image1.imageUrl),
          mediaType: images.image1.imageType,
        },
        image2: {
          mediaUrl: images.image2.imageUrl,
          mediaId: extractMediaId(images.image2.imageUrl),
          mediaType: images.image2.imageType,
        }
      },
      createdBy: req.body.currentUser.userInfo._id,
    }
    const media = await ImageSliderService.createImageSlider(imageSliderData);
    return res.json(
      new ApiResponse(200, { media }, SuccessMessage.IMAGE_SLIDER_CREATED)
    );
  }
);
export const updateImageSliderSection = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { images } = req.body;
    const { _id } = req.params;
    const updatedImageSliderData: Partial<IImageSlider> = {
      images: {
        image1: {
          mediaUrl: images.image1.imageUrl,
          mediaId: extractMediaId(images.image1.imageUrl),
          mediaType: images.image1.imageType,
        },
        image2: {
          mediaUrl: images.image2.imageUrl,
          mediaId: extractMediaId(images.image2.imageUrl),
          mediaType: images.image2.imageType,
        },
      },
      createdBy: req.body.currentUser.userInfo._id,
    };
    const media = await ImageSliderService.updateImageSlider(updatedImageSliderData, _id as string);
    if (!media) throw new ApiError(404, ErrorMessages.INVALID_UPDATE_HERO_SECTION);
    return res.json(
      new ApiResponse(200, { media }, SuccessMessage.IMAGE_UPDATED)
    );
  }
);
export const deleteImageSlider = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {_id} = req.params as { _id: string };
    const media = await ImageSliderService.getImageSliderById(_id);
    if (!media) throw new ApiError(404, ErrorMessages.IMAGE_NOT_FOUND);
    const images = [media.images.image1, media.images.image2];
    await Promise.all(
      images
        .filter((image) => image?.mediaId)
        .map((image) => deletePresignedURL(image!.mediaId))
    );
    await ImageSliderService.deleteImageSlider(_id);
    return res.json(new ApiResponse(200, {}, SuccessMessage.IMAGE_DELETED));
  }
);
export const getAllImageSliderSection = asyncHandler(
  async (req: Request, res: Response) => {
    const imageSlider = await ImageSliderService.getAllImageSliders();
    return res.json(
      new ApiResponse(200, { imageSlider }, SuccessMessage.IMAGE_SLIDER_FETCHED)
    );
  }
);
export const getImageSliderById = asyncHandler(
  async (req: Request, res: Response) => {
    const imageSlider = await ImageSliderService.getImageSliderById(req.params._id as string);
    if (!imageSlider) throw new ApiError(404, ErrorMessages.IMAGE_NOT_FOUND);
    return res.json(
      new ApiResponse(200, { imageSlider }, SuccessMessage.IMAGE_SLIDER_FETCHED)
    );
  }
);