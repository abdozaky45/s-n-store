import joi from "joi";
import { baseSchema } from "../baseSchema";
export const createCategoryValidation = baseSchema.concat(
    joi.object({
        name: joi.object({
            ar: joi.string().required(),
            en: joi.string().required()
        }).required(),
        imageUrl: joi.string().required(),
    }).required()
);
export const updateCategoryValidation = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
        name: joi.object({
            ar: joi.string().optional(),
            en: joi.string().optional(),
        }).optional(),
        imageUrl: joi.string().optional(),
        isNewArrival: joi.boolean().optional(),
    }).required()
);
export const deleteCategoryValidation = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    }).required()
);