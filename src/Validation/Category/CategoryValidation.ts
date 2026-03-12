import joi from "joi";
import { baseSchema } from "../baseSchema";
export const createCategoryValidation = baseSchema.concat(
    joi.object({
        categoryNameAr: joi.string().required(),
        categoryNameEn: joi.string().required(),
        imageUrl: joi.string().required(),
    }).required()
);
export const updateCategoryValidation = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
        categoryNameAr: joi.string().optional(),
        categoryNameEn: joi.string().optional(),
        imageUrl: joi.string().optional(),
        isNewArrival: joi.boolean().optional(),
    }).required()
);
export const deleteCategoryValidation = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    }).required()
);