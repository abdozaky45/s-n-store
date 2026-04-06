import { Router } from "express";
import * as CustomerController from "../../Controller/Customer/CustomerController";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as CustomerValidation from "../../Validation/User/Customer/CustomerValidation";
const CustomerRouter = Router();
CustomerRouter.post("/identify",Validation(CustomerValidation.addCustomerValidation), CustomerController.identifyCustomer);
CustomerRouter.patch("/:_id", Validation(CustomerValidation.updateCustomerValidation), CustomerController.updateCustomer);
CustomerRouter.get("/:_id", Validation(CustomerValidation.findCustomerByIdValidation), CustomerController.findCustomerById);
export default CustomerRouter;