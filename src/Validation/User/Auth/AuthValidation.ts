import joi from "joi";
export const AuthValidationEmail = joi.object({
  email: joi
    .string()
    .email({
      tlds: { allow: false },
    })
    .required()
    .messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
}).required();
export const activeAccount = joi.object({
   email: joi
    .string()
    .email({
      tlds: { allow: false },
    })
    .required()
    .messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    activeCode: joi.string().required()
}).required();
