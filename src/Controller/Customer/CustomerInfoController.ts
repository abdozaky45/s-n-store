import { NextFunction, Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import SuccessMessage from "../../Utils/SuccessMessages";
import * as userService from "../../Service/User/CustomerInfoService";
import ICustomerInfo from "../../Model/User/Customer/ICustomerInfoModel";
import { findCustomerById } from "../../Service/User/CustomerService";
export const addCustomerInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userData: ICustomerInfo = {
      customer: req.body.customer,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      apartmentSuite: req.body.apartmentSuite,
      shipping: req.body.shipping,
      postalCode: req.body.postalCode,
      additionalPhone: req.body.additionalPhone,
    };
    const result = await userService.createCutsomerInfo(userData);
    const user = await userService.findCutsomerInfoById(result._id);
    return res.json(new ApiResponse(200, { user }, SuccessMessage.USER_CREATED));
  }
);
export const updateCustomerInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const checkUser = await userService.findCutsomerInfoById(req.params._id as string);
    if (!checkUser) {
      return next(new ApiError(404, ErrorMessages.USER_NOT_FOUND));
    }
    const userData: ICustomerInfo = {
      customer: req.body.customer,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      apartmentSuite: req.body.apartmentSuite,
      shipping: req.body.shipping,
      postalCode: req.body.postalCode,
      additionalPhone: req.body.additionalPhone
    };
    const result = await userService.updateCutsomerInfo(checkUser._id, userData);
    const user = await userService.findCutsomerInfoById(result!._id);
    return res.json(new ApiResponse(200, { user }, SuccessMessage.USER_UPDATED));
  }
);
export const deleteCustomerInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.deleteCutsomerInfo(req.params.customer as string);
    if(!user){
      return next(new ApiError(404, ErrorMessages.USER_NOT_FOUND));
    }
    return res.json(new ApiResponse(200, {}, SuccessMessage.USER_DELETED));
  }
);
export const getAllCutsomerInfoByCustomerId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const checkUser = await findCustomerById(req.params.customer as string);
    if (!checkUser) {
      return next(new ApiError(404, ErrorMessages.USER_NOT_FOUND));
    }
    const users = await userService.findCutsomerInfoByCustomerId(checkUser._id);
    return res.json(new ApiResponse(200, { users }, SuccessMessage.USER_FOUND));
  }
);
export const getCutsomerInfoById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.findCutsomerInfoById(req.params._id as string);
    if (!user) {
      return next(new ApiError(404, ErrorMessages.USER_NOT_FOUND));
    }
    return res.json(new ApiResponse(200, { user }, SuccessMessage.USER_FOUND));
  }
);
