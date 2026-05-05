import joi from "joi";
import { baseSchema } from "../baseSchema";
export const createCategoryValidation = baseSchema.concat(
    joi.object({
        name: joi.object({
            ar: joi.string().required(),
            en: joi.string().required()
        }).required(),
        groupSize: joi.string().required(),
        imageUrl: joi.string().required(),
        iconId: joi.string().required(),
    }).required()
);
export const updateCategoryValidation = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
        name: joi.object({
            ar: joi.string().optional(),
            en: joi.string().optional(),
        }).optional(),
        groupSize: joi.string().optional(),
        imageUrl: joi.string().optional(),
        iconId: joi.string().optional(),
        isNewArrival: joi.boolean().optional(),
    }).required()
);
export const categoryIdAdminValidationSchema = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    }).required()
);
export const categoryIdUserValidationSchema = joi.object({
    _id: joi.string().required(),
}).required()
