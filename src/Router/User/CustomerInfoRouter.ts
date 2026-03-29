import { Router } from "express";
import * as CustomerInfoController from "../../Controller/Customer/CustomerInfoController";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as userValidation from "../../Validation/User/UserInformation";
const customerInfoRouter = Router();
customerInfoRouter.post(
  "/add-info",
  Validation(userValidation.createUser),
  CustomerInfoController.addCustomerInfo
);
customerInfoRouter.patch(
  "/update-info/:_id",
  Validation(userValidation.updateUser),
  CustomerInfoController.updateCustomerInfo
);
customerInfoRouter.delete(
  "/delete-info/:_id",
  Validation(userValidation.userIdValidationSchema),
  CustomerInfoController.deleteCustomerInfo
);
customerInfoRouter.get(
  "/all-info/:primaryPhone",
  Validation(userValidation.getAllUserInformationRelatedToUser),
  CustomerInfoController.getAllCutsomerInfoByCustomerId
);
customerInfoRouter.get(
  "/get-one/:_id",
  Validation(userValidation.userIdValidationSchema),
  CustomerInfoController.getCutsomerInfoById
);
export default customerInfoRouter;
