import joi from "joi";
export const createUser = joi
  .object({
    firstName: joi.string().min(2).max(50).required(),
    lastName: joi.string().min(2).max(50).required(),
    address: joi.string().min(1).max(500).required(),
    apartmentSuite: joi.string().min(1).max(500).allow("").optional(),
    shipping: joi.string().required(),
    postalCode: joi.string().min(3).max(6).allow("").optional(),
    primaryPhone: joi.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).required(),
    secondaryPhone: joi.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).allow("").optional(),
  })
  .required();
export const updateUser =
  joi
    .object({
      _id: joi.string().required(),
      firstName: joi.string().min(2).max(50).optional(),
      lastName: joi.string().min(2).max(50).optional(),
      address: joi.string().min(1).max(500).optional(),
      apartmentSuite: joi.string().min(1).max(500).optional().allow(""),
      shipping: joi.string().optional(),
      postalCode: joi.string().min(3).max(6).optional().allow(""),
      primaryPhone: joi.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).optional(),
      secondaryPhone: joi.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).allow("").optional(),

    })
    .required();
export const getAllUserInformationRelatedToUser = joi
  .object({
    primaryPhone: joi.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).required(),
  })
  .required();

export const userIdValidationSchema = joi
  .object({
    _id: joi.string().required(),
  })
  .required();