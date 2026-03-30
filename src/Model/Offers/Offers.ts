import {Schema , model } from "mongoose";
import { IOffer } from "./IOffers";
import { EnumStringRequired, RequiredBoolean, RequiredNumber, RequiredString } from "../../Utils/Schemas";
import { offerTypeArray } from "../../Utils/OfferType";
import { ImageSchema } from "../Product/ProductModel";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
const offerSchema = new Schema<IOffer>({
    type: EnumStringRequired(offerTypeArray),
    isActive:RequiredBoolean,
    image: ImageSchema,
    description: {
        ar:RequiredString,
        en:RequiredString
    },
    discountAmount: RequiredNumber,
    minOrderAmount: RequiredNumber
});
const OfferModel = model(SchemaTypesReference.Offer, offerSchema);
export default OfferModel;