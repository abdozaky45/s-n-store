import { Router } from "express";
import * as CustomerInfoController from "../../Controller/Customer/CustomerInfoController";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as CustomerinfoValidation from "../../Validation/User/Customer/CustomerInfoValidation";
const customerInfoRouter = Router();
customerInfoRouter.post(
  "/add-info",
  Validation(CustomerinfoValidation.addCustomerInfoValidation),
  CustomerInfoController.addCustomerInfo
);
customerInfoRouter.patch(
  "/update-info/:_id",
  Validation(CustomerinfoValidation.updateCustomerInfo),
  CustomerInfoController.updateCustomerInfo
);
customerInfoRouter.delete(
  "/delete-info/:customer",
  Validation(CustomerinfoValidation.customerIdValidationSchema),
  CustomerInfoController.deleteCustomerInfo
);
customerInfoRouter.get(
  "/all-info/:customer",
  Validation(CustomerinfoValidation.getCustomerInfoByCustomerId),
  CustomerInfoController.getAllCutsomerInfoByCustomerId
);
customerInfoRouter.get(
  "/get-one/:_id",
  Validation(CustomerinfoValidation.customerIdValidationSchema),
  CustomerInfoController.getCutsomerInfoById
);
export default customerInfoRouter;
