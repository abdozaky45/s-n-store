import joi from 'joi';
import { baseSchema } from '../baseSchema';
import { ALLOWED_IMAGE_TYPES } from '../../Utils/AllowedMediaTypes';

export const getPresignedUrlValidation = baseSchema.concat(
    joi.object({
        folder: joi.string().required(),
        files: joi.array().items(
            joi.object({
                contentType: joi.string().valid(...ALLOWED_IMAGE_TYPES).required(),
                fileName: joi.string().optional(),
            })
        ).min(1).required(),
    }).required()
);

export const deletePresignedUrlValidation = baseSchema.concat(
    joi.object({
        fileName: joi.string().required(),
    }).required()
);