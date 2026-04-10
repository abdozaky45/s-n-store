import { Router } from 'express';
import OrderController from '../../Controller/Order/OrderController';
import * as orderValidation from '../../Validation/Order/OrderValidation';
import { Validation } from '../../middleware/ValidationMiddleware';
const OrderRouter = Router();
OrderRouter.get(
  "/admin/all",
  Validation(orderValidation.getAllOrdersValidation),
  OrderController.getAllOrdersController
);

OrderRouter.get(
  "/admin/:orderId",
  Validation(orderValidation.AdminOrderIdValidation),
  OrderController.getOrderByIdController
);

OrderRouter.patch(
  "/admin/status/:orderId",
  Validation(orderValidation.updateOrderStatusValidation),
  OrderController.updateOrderStatusController
);

OrderRouter.patch(
  "/admin/free-shipping/:orderId",
  Validation(orderValidation.AdminOrderIdValidation),
  OrderController.applyFreeShippingController
);
export default OrderRouter;
