import joi from "joi";
import { baseSchema } from "../baseSchema";
export const socialReviewInputSchema = baseSchema.concat(
    joi.object({
        image: joi.string().required()
    })
).required();
export const socialReviewIdSchema = baseSchema.concat(
    joi.object({
        id: joi.string().hex().length(24).required()
    })
).required();

