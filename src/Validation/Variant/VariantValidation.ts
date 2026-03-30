import joi from "joi";
import { baseSchema } from "../baseSchema";

export const createVariantValidation = baseSchema.concat(
  joi.object({
    productId: joi.string().required(),
    size: joi.string().required(),
    color: joi.string().required(),
    quantity: joi.number().min(0).required(),
  }).required()
);

export const updateVariantQuantityValidation = baseSchema.concat(
  joi.object({
    quantity: joi.number().min(0).required(),
    productId: joi.string().required(),
  }).required()
);

export const variantIdValidation = baseSchema.concat(
  joi.object({
    variantId: joi.string().required(),
  }).required()
);

export const getVariantsByProductValidation = baseSchema.concat(
  joi.object({
    productId: joi.string().required(),
  }).required()
);