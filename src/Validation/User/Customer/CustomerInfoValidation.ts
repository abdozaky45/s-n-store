import joi  from "joi";
export const addCustomerInfoValidation = joi
  .object({
    customer: joi.string().required(),
    firstName: joi.string().min(2).max(50).required(),
    lastName: joi.string().min(2).max(50).required(),
    address: joi.string().min(1).max(500).required(),
    apartmentSuite: joi.string().min(1).max(500).allow("").optional(),
    shipping: joi.string().required(),
    postalCode: joi.string().min(3).max(6).allow("").optional(),
    additionalPhone: joi.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).allow("").optional(),
  })
  .required();
export const updateCustomerInfo =
  joi
    .object({
      _id: joi.string().required(),
      customer: joi.string().optional(),
      firstName: joi.string().min(2).max(50).optional(),
      lastName: joi.string().min(2).max(50).optional(),
      address: joi.string().min(1).max(500).optional(),
      apartmentSuite: joi.string().min(1).max(500).optional().allow(""),
      shipping: joi.string().optional(),
      postalCode: joi.string().min(3).max(6).optional().allow(""),
      additionalPhone: joi.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).allow("").optional(),

    })
    .required();
export const getCustomerInfoByCustomerId = joi
  .object({
    customer: joi.string().required(),
  })
  .required();

export const customerIdValidationSchema = joi
  .object({
    _id: joi.string().required(),
  })
  .required();