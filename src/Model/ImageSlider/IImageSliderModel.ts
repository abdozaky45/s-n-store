import { Types } from "mongoose";
interface sliderMediaAsset {
  mediaUrl: string;
  mediaId: string;
  mediaType: string; // small, large
}
export default interface IImageSlider {
  images:{
    image1: sliderMediaAsset;
    image2: sliderMediaAsset;
  };
  createdBy: Types.ObjectId | string;
}
