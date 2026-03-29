import joi  from "joi";
export const addCustomerValidation = joi
  .object({
    phone: joi.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).required(),
  })
  .required();
export const updateCustomerValidation = joi
  .object({
    _id: joi.string().required(),
    phone: joi.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).optional(),
  })
  .required();
export const findCustomerByIdValidation = joi
  .object({
    _id: joi.string().required(),
  })
  .required();