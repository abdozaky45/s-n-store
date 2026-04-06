import { NextFunction, Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import SuccessMessage from "../../Utils/SuccessMessages";
import * as customerInfoService from "../../Service/User/CustomerInfoService";
import ICustomerInfo from "../../Model/User/Customer/ICustomerInfoModel";
import { checkCustomerExists, getCustomerById } from "../../Service/User/CustomerService";
import ShippingService from "../../Service/Shipping/ShippingService";
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
    const checkCustomer = await checkCustomerExists(userData.customer as string);
    if (!checkCustomer) {
      throw new ApiError(404, ErrorMessages.CUSTOMER_NOT_FOUND);
    }
    const checkShipping = await ShippingService.checkShippingExists(userData.shipping as string);
    if (!checkShipping) {
      throw new ApiError(404, ErrorMessages.SHIPPING_NOT_FOUND);
    }
    const user = await customerInfoService.createCutsomerInfo(userData);
    return res.json(new ApiResponse(200, { user }, SuccessMessage.USER_CREATED));
  }
);
export const updateCustomerInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.customer) {
      const checkCustomer = await checkCustomerExists(req.body.customer);
      if (!checkCustomer) throw new ApiError(404, ErrorMessages.CUSTOMER_NOT_FOUND);
    }
    if (req.body.shipping) {
      const checkShipping = await ShippingService.checkShippingExists(req.body.shipping);
      if (!checkShipping) throw new ApiError(404, ErrorMessages.SHIPPING_NOT_FOUND);
    }
    const allowedFields: (keyof ICustomerInfo)[] = [
      'customer', 'firstName', 'lastName', 'address',
      'apartmentSuite', 'shipping', 'postalCode', 'additionalPhone'
    ];
    const customerData = allowedFields.reduce((acc, field) => {
      if (req.body[field] !== undefined) acc[field] = req.body[field];
      return acc;
    }, {} as Partial<ICustomerInfo>);
    const user = await customerInfoService.updateCutsomerInfo(req.params._id as string, customerData);
    if (!user) throw new ApiError(404, ErrorMessages.CUSTOMER_INFO_NOT_FOUND);

    return res.json(new ApiResponse(200, { user }, SuccessMessage.USER_UPDATED));
  }
);
export const deleteCustomerInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await customerInfoService.deleteCutsomerInfo(req.params._id as string);
    if (!user) {
      throw new ApiError(404, ErrorMessages.CUSTOMER_INFO_NOT_FOUND);
    }
    return res.json(new ApiResponse(200, {}, SuccessMessage.USER_DELETED));
  }
);
export const getAllCutsomerInfoByCustomerId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const checkUser = await checkCustomerExists(req.params.customer as string);
    if (!checkUser) {
      throw new ApiError(404, ErrorMessages.CUSTOMER_NOT_FOUND);
    }
    const users = await customerInfoService.gitCutsomerInfoByCustomerId(checkUser._id);
    return res.json(new ApiResponse(200, { users }, SuccessMessage.USER_FOUND));
  }
);
export const getCutsomerInfoById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await customerInfoService.getCustomerInfoById(req.params._id as string);
    if (!user) {
      throw new ApiError(404, ErrorMessages.CUSTOMER_INFO_NOT_FOUND);
    }
    return res.json(new ApiResponse(200, { user }, SuccessMessage.USER_FOUND));
  }
);
