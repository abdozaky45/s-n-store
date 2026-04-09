import { Request, Response } from 'express';
import { ApiError, ApiResponse, asyncHandler } from '../../Utils/ErrorHandling';
import OrderService from '../../Service/Order/OrderService';
import ErrorMessages from '../../Utils/Error';
import SuccessMessage from '../../Utils/SuccessMessages';

class OrderController {
 createOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const { customer, shipping, products } = req.body;
    const order = await OrderService.createOrder({
      customer,
      shipping,
      products,
    });
    // send email to customer and admin
    return res.status(201).json(new ApiResponse(201, { order }, SuccessMessage.ORDER_CREATED));
  }
);

// ✅ Track Orders by Customer ID (User)
trackOrdersByCustomerIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params as { customerId: string };
    const orders = await OrderService.trackOrdersByCustomerId(customerId);
    return res.json(new ApiResponse(200, { orders }, SuccessMessage.ORDER_FOUND));
  }
);

// ✅ Track Order by Order Number (User)
trackOrderByOrderNumberController = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderNumber } = req.params as { orderNumber: string };
    const order = await OrderService.trackOrderByOrderNumber(orderNumber);
    if (!order) throw new ApiError(404, ErrorMessages.ORDER_NOT_FOUND);
    return res.json(new ApiResponse(200, { order }, SuccessMessage.ORDER_FOUND));
  }
);

// ✅ Cancel Order (User)
cancelOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.params as { orderId: string };
    const order = await OrderService.cancelOrder(orderId);
    return res.json(new ApiResponse(200, { order }, SuccessMessage.ORDER_CANCELLED));
  }
);

// ✅ Get User Orders with Pagination (User)
getUserOrdersController = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params as { customerId: string };
    const { page, searchTerm } = req.query;
    const orders = await OrderService.getUserOrders(
      customerId,
      Number(page),
      searchTerm as string
    );
    return res.json(new ApiResponse(200, orders, SuccessMessage.ORDER_FOUND));
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
    const { status, orderNumber, page } = req.query;
    const orders = await OrderService.getAllOrders({
      status: status as string,
      orderNumber: orderNumber as string,
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
