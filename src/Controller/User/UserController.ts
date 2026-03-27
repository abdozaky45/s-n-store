import { NextFunction, Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import SuccessMessage from "../../Utils/SuccessMessages";
import * as userService from "../../Service/User/UserService";
import Iuser from "../../Model/User/UserInformation/Iuser";
export const addUserInformation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userData: Iuser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      apartmentSuite: req.body.apartmentSuite,
      shipping: req.body.shipping,
      postalCode: req.body.postalCode,
      primaryPhone: req.body.primaryPhone,
      secondaryPhone: req.body.secondaryPhone,
    };
    const result = await userService.createUser(userData);
    const user = await userService.findUserInformationById(result._id);
    return res.json(new ApiResponse(200, { user }, SuccessMessage.USER_CREATED));
  }
);
export const updateUserInformation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const checkUser = await userService.findUserInformationById(req.params._id as string);
    if (!checkUser) {
      return next(new ApiError(404, ErrorMessages.USER_NOT_FOUND));
    }
    const userData: Iuser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      apartmentSuite: req.body.apartmentSuite,
      shipping: req.body.shipping,
      postalCode: req.body.postalCode,
      primaryPhone: req.body.primaryPhone,
      secondaryPhone: req.body.secondaryPhone
    };
    const result = await userService.updateUserInformation(checkUser._id, userData);
    const user = await userService.findUserInformationById(result!._id);
    return res.json(new ApiResponse(200, { user }, SuccessMessage.USER_UPDATED));
  }
);
export const deleteUserInformation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const checkUser = await userService.findUserInformationById(req.params._id as string);
    if (!checkUser) {
      return next(new ApiError(404, ErrorMessages.USER_NOT_FOUND));
    }
    const user = await userService.deleteUserInformation(checkUser._id);
    return res.json(new ApiResponse(200, {}, SuccessMessage.USER_DELETED));
  }
);
export const getAllUserInformationRelatedToUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const checkUser = await userService.checkIfPrimaryPhoneExists(req.params.primaryPhone as string);
    if (!checkUser) {
      return next(new ApiError(404, ErrorMessages.USER_NOT_FOUND));
    }
    const users = await userService.fetchUserDetailsByPrimaryPhone(req.params.primaryPhone as string);
    return res.json(new ApiResponse(200, { users }, SuccessMessage.USER_FOUND));
  }
);
export const getUserInformationById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.findUserInformationById(req.params._id as string);
    if (!user) {
      return next(new ApiError(404, ErrorMessages.USER_NOT_FOUND));
    }
    return res.json(new ApiResponse(200, { user }, SuccessMessage.USER_FOUND));
  }
);
