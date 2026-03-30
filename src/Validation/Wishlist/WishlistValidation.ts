import joi from "joi";
 export const wishlistValidationSchema = joi.object({
    customer: joi.string().required(),
    productId: joi.string().required(),
 }).required();
 export const getWishlistByIdValidation = joi.object({
    _id: joi.string().required(),
 }).required();
 export const getAllUSerWishlistValidation = joi.object({
    customer: joi.string().required(),
 }).required();