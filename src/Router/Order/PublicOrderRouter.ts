import {Router} from 'express';
import OrderController from '../../Controller/Order/OrderController';
import * as orderValidation from '../../Validation/Order/OrderValidation';
import { Validation } from '../../middleware/ValidationMiddleware';
const PublicOrderRouter = Router();
PublicOrderRouter.post(
  "/",
  Validation(orderValidation.createOrderValidation),
  OrderController.createOrderController
);

PublicOrderRouter.get(
  "/track/customer/:customerId",
  Validation(orderValidation.customerIdValidation),
  OrderController.trackOrdersByCustomerIdController
);

PublicOrderRouter.get(
  "/track/:orderNumber",
  Validation(orderValidation.orderNumberValidation),
  OrderController.trackOrderByOrderNumberController
);

PublicOrderRouter.get(
  "/user/:customerId",
  Validation(orderValidation.getUserOrdersValidation),
  OrderController.getUserOrdersController
);

PublicOrderRouter.patch(
  "/cancel/:orderId",
  Validation(orderValidation.orderIdValidation),
  OrderController.cancelOrderController
);
export default PublicOrderRouter;