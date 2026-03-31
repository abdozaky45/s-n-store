import joi from "joi";
import { baseSchema } from "../baseSchema";
export const subCategoryValidation = baseSchema.concat(
    joi.object({
       name: joi.object({
        ar: joi.string().required(),
        en: joi.string().required()
       }).required(),
        category: joi.string().required(),
        imageUrl: joi.string().required(),
    }).required()
);
export const updateSubCategoryValidation = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
        name: joi.object({
            ar: joi.string().optional(),
            en: joi.string().optional()
        }).optional(),
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