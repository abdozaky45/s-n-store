import joi, { string } from "joi";
import { baseSchema } from "../baseSchema";
import { offerTypeArray } from "../../Utils/OfferType";

export const createOfferValidation = baseSchema.concat(
    joi.object({
        type: joi.string().valid(...offerTypeArray).required(),
        isActive: joi.boolean().required(),
        image:joi.string().required(),
        description: joi.object({
            ar: joi.string().required(),
            en: joi.string().required(),
        }).required(),
        minOrderAmount: joi.number().required(),
        discountAmount: joi.number().optional(),
    }).required()
);

export const updateOfferValidation = baseSchema.concat(
    joi.object({
        offerId: joi.string().required(),
        type: joi.string().valid(...offerTypeArray).optional(),
        isActive: joi.boolean().optional(),
        image: joi.string().optional(),
        description: joi.object({
            ar: joi.string().optional(),
            en: joi.string().optional(),
        }).optional(),
        minOrderAmount: joi.number().optional(),
        discountAmount: joi.number().optional(),
    }).required()
);

export const offerIdValidation = baseSchema.concat(
    joi.object({
        offerId: joi.string().required(),
    }).required()
);

export const toggleOfferValidation = baseSchema.concat(
    joi.object({
        offerId: joi.string().required(),
        isActive: joi.boolean().required(),
    }).required()
);