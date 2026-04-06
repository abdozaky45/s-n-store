import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import SuccessMessage from "../../Utils/SuccessMessages";
import * as CustomerService from "../../Service/User/CustomerService";
import ICustomer from "../../Model/User/Customer/ICustomerModel";
export const identifyCustomer = asyncHandler(
  async (req: Request, res: Response, next) => {
    const customerData :  ICustomer = {
      phone: CustomerService.normalizeEgyptianPhone(req.body.phone),
    };
    const customer = await CustomerService.identifyCustomer(customerData);
    return res.json(new ApiResponse(200, { customer }, SuccessMessage.CUSTOMER_IDENTIFIED));
  }
);
export const updateCustomer = asyncHandler(
  async (req: Request, res: Response, next) => {
    const customerData :  ICustomer = {
        phone: CustomerService.normalizeEgyptianPhone(req.body.phone),
    };
    const customer = await CustomerService.updateCustomer(req.params._id as string, customerData);
    if (!customer) {
      return next(new ApiError(404, ErrorMessages.CUSTOMER_NOT_FOUND));
    }   
    return res.json(new ApiResponse(200, { customer }, SuccessMessage.CUSTOMER_UPDATED));
    }
);
export const getCustomerById = asyncHandler(
  async (req: Request, res: Response, next) => {
    const customer = await CustomerService.getCustomerById(req.params._id as string);
    if (!customer) {
      return next(new ApiError(404, ErrorMessages.CUSTOMER_NOT_FOUND));
    }
    return res.json(new ApiResponse(200, { customer }, SuccessMessage.CUSTOMER_FOUND));
    }
);
