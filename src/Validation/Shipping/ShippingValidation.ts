import joi from "joi";
import { baseSchema } from "../baseSchema";
export const createShipping = baseSchema.concat(
    joi
        .object({
            name: joi.object({
                ar: joi.string().required(),
                en: joi.string().required(),
            }).required(),
            cost: joi.number().required(),
        })
        .required()
).required();
export const updateShipping = baseSchema.concat(
    joi
        .object({
            _id: joi.string().required(),
            name: joi.object({
                ar: joi.string().required(),
                en: joi.string().required(),
            }).optional(),
            cost: joi.number().optional(),
        })
        .required()
).required();
export const validateShippingByIdAdmin = baseSchema.concat(
    joi.object({
        _id: joi.string().required(),
    })
).required();

export const validateShippingByIdUser = joi.object({
    _id: joi.string().required(),
}).required();