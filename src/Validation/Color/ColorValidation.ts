import joi from 'joi';
import { baseSchema } from '../baseSchema';
import _ from 'lodash';

export const createColorValidation = baseSchema.concat(joi.object({
   name:joi.object({
    ar: joi.string().required(),
    en: joi.string().required()
   }).required(),
    hex: joi.string().required()
})).required();
export const updateColorValidation = baseSchema.concat(joi.object({
    _id: joi.string().required(),
    name: joi.object({
        ar: joi.string().required(),
        en: joi.string().required()
    }).optional(),
    hex: joi.string().optional()
}));
export const colorIdValidationSchema = baseSchema.concat(joi.object({
    _id: joi.string().required()
}));

