import { baseSchema } from "../baseSchema";
import joi from "joi";
export const createProductValidation = baseSchema.concat(
  joi.object({
    productNameAr: joi.string().required(),
    productNameEn: joi.string().required(),
    productDescriptionAr: joi.string().required(),
    productDescriptionEn: joi.string().required(),
    price: joi.number().required(),
    wholesalePrice: joi.number().optional(),
    salePrice: joi.number().optional(),
    saleStartDate: joi.number().optional(),
    saleEndDate: joi.number().optional(),
    category: joi.string().required(),
    subCategory: joi.string().optional(),
    defaultImage: joi.string().required(),
    albumImages: joi.array().items(joi.string()).optional(),
    sizeChartImage: joi.string().optional(),
    sizeVariants: joi.array().items(
      joi.object({
        size: joi.string().required(),
        quantity: joi.number().required(),
      })
    ).required(),
  }).required()
);
export const updateProductValidation = baseSchema.concat(
    joi.object({
        productId: joi.string().required(),
        productNameAr: joi.string().optional(),
        productNameEn: joi.string().optional(),
        productDescriptionAr: joi.string().optional(),
        productDescriptionEn: joi.string().optional(),
        price: joi.number().optional(),
        wholesalePrice: joi.number().optional(),
        salePrice: joi.number().optional(),
        saleStartDate: joi.number().optional(),
        saleEndDate: joi.number().optional(),
        category: joi.string().optional(),
        subCategory: joi.string().optional(),
        defaultImage: joi.string().optional(),
        albumImages: joi.array().items(joi.string()).optional(),
        sizeChartImage: joi.string().optional(),
        sizeVariants: joi.array().items(
            joi.object({
                size: joi.string().required(),
                quantity: joi.number().required(),
            })
        ).optional(),
    }).required()
);
export const deleteProductValidation = baseSchema.concat(
    joi.object({
        productId: joi.string().required(),
    }).required()
);
export const getProductBySoldOutValidation = baseSchema.concat(
    joi.object({
        page: joi.string().required(),
    }).required()
);
