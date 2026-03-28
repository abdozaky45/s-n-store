import { Types } from "mongoose";
import { OfferType } from "../../Utils/OfferType";
interface offerImage {
    mediaUrl: string;
    mediaId: string;
}
export interface IOffer {
    type: OfferType | string;
    isActive: boolean;
    image: offerImage;
    description: {
        ar: string;
        en: string;
    };
    discountAmount: number;
    minOrderAmount: number;
}
