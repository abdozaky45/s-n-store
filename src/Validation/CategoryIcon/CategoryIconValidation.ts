import joi from "joi";
import { baseSchema } from "../baseSchema";

export const createCategoryIconValidation = baseSchema.concat(
  joi.object({
    key: joi.string().required(),
    svg: joi.string().required(),
    isActive: joi.boolean().optional(),
  }).required()
);

export const updateCategoryIconValidation = baseSchema.concat(
  joi.object({
    key: joi.string().required(),
    svg: joi.string().optional(),
    isActive: joi.boolean().optional(),
  }).required()
);

export const categoryIconKeyValidation = baseSchema.concat(
  joi.object({
    key: joi.string().required(),
  }).required()
);
