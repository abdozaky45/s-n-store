import joi from 'joi';
import { baseSchema } from '../baseSchema';

export const createColorValidation = baseSchema.concat(joi.object({
    colorAr: joi.string().required(),
    colorEn: joi.string().required(),
    hex: joi.string().required()
}));
export const updateColorValidation = baseSchema.concat(joi.object({
    colorAr: joi.string().required(),
    colorEn: joi.string().required(),
    hex: joi.string().required()
}));
export const colorIdValidationSchema = baseSchema.concat(joi.object({
    colorId: joi.string().required()
}));

