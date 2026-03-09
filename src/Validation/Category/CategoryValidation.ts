import joi from "joi";
import { baseSchema } from "../baseSchema";
export const createCategoryValidation = baseSchema.concat(
    joi.object({
        categoryNameAr: joi.string().required(),
        categoryNameEn: joi.string().required(),
        descriptionAr: joi.string().optional().allow(""),
        descriptionEn: joi.string().optional().allow(""),
        imageUrl: joi.string().required(),
    }).required()
);
export const updateCategoryValidation = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
        categoryNameAr: joi.string().optional(),
        categoryNameEn: joi.string().optional(),
        descriptionAr: joi.string().optional().allow(""),
        descriptionEn: joi.string().optional().allow(""),
        imageUrl: joi.string().optional(),
    }).required()
);
export const deleteCategoryValidation = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    }).required()
);