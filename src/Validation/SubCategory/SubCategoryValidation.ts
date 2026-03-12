import joi from "joi";
import { baseSchema } from "../baseSchema";
export const subCategoryValidation = baseSchema.concat(
    joi.object({
        subCategoryNameAr: joi.string().required(),
        subCategoryNameEn: joi.string().required(),
        category: joi.string().required(),
        imageUrl: joi.string().required(),
    }).required()
);
export const updateSubCategoryValidation = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
        subCategoryNameAr: joi.string().optional(),
        subCategoryNameEn: joi.string().optional(),
        category: joi.string().optional(),
        isNewArrival: joi.boolean().optional(),
        imageUrl: joi.string().optional(),
    }).required()
);
export const deleteSubCategoryValidation = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    }).required()
);