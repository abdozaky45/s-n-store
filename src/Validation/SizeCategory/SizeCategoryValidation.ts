import { baseSchema } from "../baseSchema";
import joi from "joi";
export const createGroupSize = baseSchema.concat(
    joi.object({
        name: joi.string().required(),
    }).required()
);
export const updateGroupSize = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
        name: joi.string().required(),
    }).required()
);
export const getGroupSizeById = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    })
);
export const createSizeCategory = baseSchema.concat(
   joi.object({
       groupSize: joi.string().required(),
       size: joi.string().required(),   
         order: joi.number().required() 
    }).required()
);
export const updateSizeCategory = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
        groupSize: joi.string().optional(),
        size: joi.string().optional(),   
        order: joi.number().optional() 
    }).required()
);
export const getSizeCategoryById = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    })
);
export const getSizeCategoriesByGroupId = baseSchema.concat(
    joi.object({
        groupId: joi.string().required(),
    })
);
export const deleteSizeCategoryById = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    })
);