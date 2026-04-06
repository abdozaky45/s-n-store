import joi from "joi";
import { baseSchema } from "../baseSchema";
export const socialReviewInputSchema = baseSchema.concat(
    joi.object({
        imageUrl: joi.string().required()
    })
).required();
export const socialReviewUpdateSchema = baseSchema.concat(
    joi.object({
        _id: joi.string().hex().length(24).required(),
        imageUrl: joi.string().optional()
    })
).required();
export const socialReviewIdSchema = baseSchema.concat(
    joi.object({
        _id: joi.string().hex().length(24).required(),
    })
).required();

