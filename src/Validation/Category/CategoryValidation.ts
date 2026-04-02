import joi from "joi";
import { baseSchema } from "../baseSchema";
export const createCategoryValidation = baseSchema.concat(
    joi.object({
        name: joi.object({
            ar: joi.string().required(),
            en: joi.string().required()
        }).required(),
        group: joi.string().required(),
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
        group: joi.string().optional(),
        imageUrl: joi.string().optional(),
        isNewArrival: joi.boolean().optional(),
    }).required()
);
export const _idCategoryValidation = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    }).required()
);