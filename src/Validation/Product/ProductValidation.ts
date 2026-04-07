import { baseSchema } from "../baseSchema";
import joi from "joi";
export const createProductValidation = baseSchema.concat(
    joi.object({
        name: joi.object({
            ar: joi.string().required(),
            en: joi.string().required(),
        }).required(),
        description: joi.object({
            ar: joi.string().required(),
            en: joi.string().required(),
        }).required(),
        price: joi.number().required(),
        wholesalePrice: joi.number().optional(),
        salePrice: joi.number().optional(),
        saleStartDate: joi.number().optional(),
        saleEndDate: joi.number().optional(),
        category: joi.string().required(),
        subCategory: joi.string().optional(),
        defaultImage: joi.string().required(),
        variants: joi.array().items(
            joi.object({
                size: joi.string().default("one size"),
                color: joi.string().required(),
                quantity: joi.number().min(0).required(),
            })
        ).optional(),
        albumImages: joi.array().items(joi.string()).optional(),
        sizeChartImage: joi.string().optional(),
    }).required()
);
export const updateProductValidation = baseSchema.concat(
    joi.object({
        productId: joi.string().required(),
        name: joi.object({
            ar: joi.string().optional(),
            en: joi.string().optional(),
        }).optional(),
        description: joi.object({
            ar: joi.string().optional(),
            en: joi.string().optional(),
        }).optional(),
        price: joi.number().optional(),
        wholesalePrice: joi.number().optional(),
        salePrice: joi.number().optional(),
        saleStartDate: joi.number().optional(),
        saleEndDate: joi.number().optional(),
        category: joi.string().optional(),
        subCategory: joi.string().optional(),
        defaultImage: joi.string().optional(),
        albumImages: joi.array().items(joi.string()).optional(),
        sizeChartImage: joi.string().allow(null).optional(),
        isBestSeller: joi.boolean().optional(),
        isNewArrival: joi.boolean().optional(),
    }).required()
);
export const ProductIdValidationSchema = baseSchema.concat(
    joi.object({
        productId: joi.string().required(),
    }).required()
).required();
export const ProductIdValidationSchemaForUser = joi.object({
        productId: joi.string().required(),
    }).required()

