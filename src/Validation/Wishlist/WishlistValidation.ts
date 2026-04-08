import joi from "joi";
import { baseSchema } from "../baseSchema";
 export const wishlistValidationSchema = joi.object({
    customer: joi.string().required(),
    productId: joi.string().required(),
 }).required();
 export const validateWishlistById = joi.object({
    productId: joi.string().required(),
 }).required();
 export const getAllUSerWishlistValidation = joi.object({
    customer: joi.string().required(),
 }).required();
 export const getAllWishlistValidation = baseSchema.concat(joi.object({
    page: joi.number().integer().min(1).optional(),
 })).required();