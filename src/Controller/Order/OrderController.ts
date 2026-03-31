import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse, asyncHandler } from '../../Utils/ErrorHandling';
import { sendEmail } from '../../Utils/Nodemailer/SendEmail';
import { generateInvoice } from '../../Utils/Nodemailer/SendInvoice';
import { IOrder, ProductOrder } from '../../Model/Order/Iorder';
import SchemaTypesReference from '../../Utils/Schemas/SchemaTypesReference';
import OrderService from '../../Service/Order/OrderService';
import ErrorMessages from '../../Utils/Error';
import SuccessMessage from '../../Utils/SuccessMessages';
import { orderStatusType } from '../../Utils/OrderStatusType';
import { retrieveProducts, updateStock } from '../../Service/Product/ProductService';
import { UserTypeEnum } from '../../Utils/UserType';
import {IProduct} from '../../Model/Product/Iproduct';
import { Types } from 'mongoose';
import moment from "../../Utils/DateAndTime"

class OrderController {
 createOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const { customer, shipping, products } = req.body;
    const order = await OrderService.createOrder({
      customer,
      shipping,
      products,
    });
    return res.status(201).json(new ApiResponse(201, { order }, SuccessMessage.ORDER_CREATED));
  }
);
  updateOrderStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, status } = req.body;
    const userRole = req.body.currentUser.userInfo.role;
    const order = await OrderService.getOrderById(orderId);
    if (!order) throw new ApiError(404, ErrorMessages.ORDER_NOT_FOUND);

    const productIds = order.products.map((product: ProductOrder) => product.productId);
    const foundProducts = await retrieveProducts(productIds);
    const productRecord: Record<string, IProduct> = foundProducts.reduce((acc: Record<string, IProduct>, product) => {
      acc[product._id.toString()] = product;
      return acc;
    }, {} as Record<string, IProduct>);
    if (status === orderStatusType.confirmed) {
      if (userRole !== UserTypeEnum.ADMIN) {
        throw new ApiError(403, ErrorMessages.NOT_PERMITTED);
      }
      order.status = orderStatusType.confirmed;
      await order.save();
    }
    else if (status === orderStatusType.cancelled) {
      if (userRole !== UserTypeEnum.USER) {
        throw new ApiError(403, ErrorMessages.NOT_PERMITTED);
      }
      if (![orderStatusType.under_review, orderStatusType.confirmed].includes(order.status as orderStatusType)) {
        throw new ApiError(400, ErrorMessages.NOT_CANCELLED);
      }
      await updateStock(order.products, productRecord, true);
      order.status = orderStatusType.cancelled;
      await order.save();
    }
    else if ([orderStatusType.shipped, orderStatusType.delivered, orderStatusType.ordered, orderStatusType.deleted].includes(status)) {
      if (userRole !== UserTypeEnum.ADMIN) {
        throw new ApiError(403, ErrorMessages.NOT_PERMITTED);
      }
    }
    if (status === orderStatusType.deleted) {
      if (order.status !== orderStatusType.cancelled) {
        await updateStock(order.products, productRecord, true);
      }
    }
    order.status = status;
    await order.save();

    return res.json(new ApiResponse(200, { order }, SuccessMessage.ORDER_UPDATED));
  });
  getUserOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = req.body.currentUser.userInfo;
    const orders = await OrderService.getUserOrders(_id);
    return res.json(new ApiResponse(200, { orders }, SuccessMessage.ORDER_FETCHED));
  });
  getAllOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string);
    const { status ,orderId } = req.query;
    const { role } = req.body.currentUser.userInfo;
    if (role !== UserTypeEnum.ADMIN) {
      throw new ApiError(403, ErrorMessages.NOT_PERMITTED);
    }
    const orders = await OrderService.getAllOrders(page, status as string,orderId as string);
    return res.json(new ApiResponse(200, orders, SuccessMessage.ORDER_FETCHED));
  });
  getOrderById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params as { orderId: string };
    const order = await OrderService.getOrderById(orderId);
    if (!order) throw new ApiError(404, ErrorMessages.ORDER_NOT_FOUND);
    return res.json(new ApiResponse(200, { order }, SuccessMessage.ORDER_FETCHED));
  });
}
export default new OrderController();
