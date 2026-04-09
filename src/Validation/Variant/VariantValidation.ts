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
export const updateManyVariantsValidation = baseSchema.concat(joi.object({
  productId: joi.string().hex().length(24).required(),
  variants: joi.array().items(
    joi.object({
      _id: joi.string().hex().length(24).required(),
      size: joi.string().optional(),
      color: joi.string().hex().length(24).optional(),
      quantity: joi.number().integer().min(0).optional(),
    })
  ).min(1).required(),
}));

export const deleteManyVariantsValidation = baseSchema.concat(joi.object({
  productId: joi.string().hex().length(24).required(),
  variantIds: joi.array().items(
    joi.string().hex().length(24)
  ).min(1).required(),
}));

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