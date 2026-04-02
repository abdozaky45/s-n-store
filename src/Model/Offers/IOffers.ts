import { OfferTypeEnum } from "../../Utils/OfferType";
interface offerImage {
    mediaUrl: string;
    mediaId: string;
}
export interface IOffer {
    type: OfferTypeEnum | string;
    isActive: boolean;
    image: offerImage;
    description: {
        ar: string;
        en: string;
    };
    discountAmount: number;
    minOrderAmount: number;
}
