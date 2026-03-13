import { baseSchema } from "../baseSchema";
import joi from "joi";
export const createSizeCategory = baseSchema.concat(
   joi.object({
       sizeCategory: joi.string().required(),
       size: joi.string().required(),   
         order: joi.number().required() 
    }).required()
);
export const updateSizeCategory = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
        sizeCategory: joi.string().optional(),
        size: joi.string().optional(),   
        order: joi.number().optional() 
    }).required()
);
export const getSizeCategoryById = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    })
);
export const deleteSizeCategoryById = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    })
);