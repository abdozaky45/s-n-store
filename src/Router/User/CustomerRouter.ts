import { Router } from "express";
import * as CustomerController from "../../Controller/Customer/CustomerController";
const CustomerRouter = Router();
CustomerRouter.post("/identify", CustomerController.identifyCustomer);
CustomerRouter.patch("/:_id", CustomerController.updateCustomer);
CustomerRouter.get("/:_id", CustomerController.findCustomerById);
export default CustomerRouter;