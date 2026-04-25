import { Request, Response } from 'express';
import { ApiError, ApiResponse, asyncHandler } from '../../Utils/ErrorHandling';
import OrderService from '../../Service/Order/OrderService';
import ErrorMessages from '../../Utils/Error';
import SuccessMessage from '../../Utils/SuccessMessages';
import { checkCustomerExists } from '../../Service/User/CustomerService';
import { sendOrderConfirmationEmail } from '../../Utils/Nodemailer/SendOrderConfirmation';
import { sendAdminOrderNotification } from '../../Utils/Nodemailer/SendAdminNotification';
import { sendCancelOrderNotification } from '../../Utils/Nodemailer/SendCancelNotification';

class OrderController {
  createOrderController = asyncHandler(
    async (req: Request, res: Response) => {
      const { customerInfo, customer, products } = req.body;
      const order = await OrderService.createOrder({
        customerInfo,
        customer,
        products,
      });
      sendOrderConfirmationEmail(customerInfo, order);
      sendAdminOrderNotification(order);
      return res.status(201).json(new ApiResponse(201, { order }, SuccessMessage.ORDER_CREATED));
    }
  );
  // ✅ Get User Orders with Pagination (User)
  getUserOrdersController = asyncHandler(
    async (req: Request, res: Response) => {
      const { customerId } = req.params as { customerId: string };
      const customerExists = await checkCustomerExists(customerId);
      if (!customerExists) throw new ApiError(404, ErrorMessages.CUSTOMER_NOT_FOUND);
      const { page, search} = req.query;
      const orders = await OrderService.getAllUserOrders(
        customerId,
        Number(page),
        search as string
      );
      return res.json(new ApiResponse(200, orders, SuccessMessage.ORDER_FOUND));
    }
  );
  // ✅ Cancel Order (User)
  cancelOrderController = asyncHandler(
    async (req: Request, res: Response) => {
      const { orderId } = req.params as { orderId: string };
      const order = await OrderService.cancelOrder(orderId);
      sendCancelOrderNotification(order);
      return res.json(new ApiResponse(200, { order }, SuccessMessage.ORDER_CANCELLED));
    }
  );
  // ✅ Get Order By ID (Admin)
  getOrderByIdController = asyncHandler(
    async (req: Request, res: Response) => {
      const { orderId } = req.params as { orderId: string };
      const order = await OrderService.getOrderById(orderId);
      if (!order) throw new ApiError(404, ErrorMessages.ORDER_NOT_FOUND);
      return res.json(new ApiResponse(200, { order }, SuccessMessage.ORDER_FOUND));
    }
  );
  // ✅ Get All Orders (Admin)
  getAllOrdersController = asyncHandler(
    async (req: Request, res: Response) => {
      const { status, search, page } = req.query;
      const orders = await OrderService.getAllOrders({
        status: status as string,
        orderNumber: search as string,
        page: Number(page),
      });
      return res.json(new ApiResponse(200, orders, SuccessMessage.ORDER_FOUND));
    }
  );
  // ✅ Update Order Status (Admin)
  updateOrderStatusController = asyncHandler(
    async (req: Request, res: Response) => {
      const { orderId } = req.params as { orderId: string };
      const { status } = req.body;
      const order = await OrderService.updateOrderStatus(orderId, status);
      return res.json(new ApiResponse(200, { order }, SuccessMessage.ORDER_UPDATED));
    }
  );
  // ✅ Apply Free Shipping (Admin)
  applyFreeShippingController = asyncHandler(
    async (req: Request, res: Response) => {
      const { orderId } = req.params as { orderId: string };
      const order = await OrderService.applyFreeShipping(orderId);
      if (!order) throw new ApiError(404, ErrorMessages.ORDER_NOT_FOUND);
      return res.json(new ApiResponse(200, { order }, SuccessMessage.ORDER_UPDATED));
    }
  );
}
export default new OrderController();
