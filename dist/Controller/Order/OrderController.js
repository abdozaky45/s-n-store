"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const OrderService_1 = __importDefault(require("../../Service/Order/OrderService"));
const Error_1 = __importDefault(require("../../Utils/Error"));
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
class OrderController {
    constructor() {
        this.createOrderController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
            const { customer, shipping, products } = req.body;
            const order = await OrderService_1.default.createOrder({
                customer,
                shipping,
                products,
            });
            // send email to customer and admin
            return res.status(201).json(new ErrorHandling_1.ApiResponse(201, { order }, SuccessMessages_1.default.ORDER_CREATED));
        });
        // ✅ Track Orders by Customer ID (User)
        this.trackOrdersByCustomerIdController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
            const { customerId } = req.params;
            const orders = await OrderService_1.default.trackOrdersByCustomerId(customerId);
            return res.json(new ErrorHandling_1.ApiResponse(200, { orders }, SuccessMessages_1.default.ORDER_FOUND));
        });
        // ✅ Track Order by Order Number (User)
        this.trackOrderByOrderNumberController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
            const { orderNumber } = req.params;
            const order = await OrderService_1.default.trackOrderByOrderNumber(orderNumber);
            if (!order)
                throw new ErrorHandling_1.ApiError(404, Error_1.default.ORDER_NOT_FOUND);
            return res.json(new ErrorHandling_1.ApiResponse(200, { order }, SuccessMessages_1.default.ORDER_FOUND));
        });
        // ✅ Cancel Order (User)
        this.cancelOrderController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
            const { orderId } = req.params;
            const order = await OrderService_1.default.cancelOrder(orderId);
            return res.json(new ErrorHandling_1.ApiResponse(200, { order }, SuccessMessages_1.default.ORDER_CANCELLED));
        });
        // ✅ Get User Orders with Pagination (User)
        this.getUserOrdersController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
            const { customerId } = req.params;
            const { page, searchTerm } = req.query;
            const orders = await OrderService_1.default.getUserOrders(customerId, Number(page), searchTerm);
            return res.json(new ErrorHandling_1.ApiResponse(200, orders, SuccessMessages_1.default.ORDER_FOUND));
        });
        // ✅ Get Order By ID (Admin)
        this.getOrderByIdController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
            const { orderId } = req.params;
            const order = await OrderService_1.default.getOrderById(orderId);
            if (!order)
                throw new ErrorHandling_1.ApiError(404, Error_1.default.ORDER_NOT_FOUND);
            return res.json(new ErrorHandling_1.ApiResponse(200, { order }, SuccessMessages_1.default.ORDER_FOUND));
        });
        // ✅ Get All Orders (Admin)
        this.getAllOrdersController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
            const { status, orderNumber, page } = req.query;
            const orders = await OrderService_1.default.getAllOrders({
                status: status,
                orderNumber: orderNumber,
                page: Number(page),
            });
            return res.json(new ErrorHandling_1.ApiResponse(200, orders, SuccessMessages_1.default.ORDER_FOUND));
        });
        // ✅ Update Order Status (Admin)
        this.updateOrderStatusController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
            const { orderId } = req.params;
            const { status } = req.body;
            const order = await OrderService_1.default.updateOrderStatus(orderId, status);
            return res.json(new ErrorHandling_1.ApiResponse(200, { order }, SuccessMessages_1.default.ORDER_UPDATED));
        });
        // ✅ Apply Free Shipping (Admin)
        this.applyFreeShippingController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
            const { orderId } = req.params;
            const order = await OrderService_1.default.applyFreeShipping(orderId);
            if (!order)
                throw new ErrorHandling_1.ApiError(404, Error_1.default.ORDER_NOT_FOUND);
            return res.json(new ErrorHandling_1.ApiResponse(200, { order }, SuccessMessages_1.default.ORDER_UPDATED));
        });
        // updateOrderStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        //   const { orderId, status } = req.body;
        //   const userRole = req.body.currentUser.userInfo.role;
        //   const order = await OrderService.getOrderById(orderId);
        //   if (!order) throw new ApiError(404, ErrorMessages.ORDER_NOT_FOUND);
        //   const productIds = order.products.map((product: ProductOrder) => product.productId);
        //   const foundProducts = await retrieveProducts(productIds);
        //   const productRecord: Record<string, IProduct> = foundProducts.reduce((acc: Record<string, IProduct>, product) => {
        //     acc[product._id.toString()] = product;
        //     return acc;
        //   }, {} as Record<string, IProduct>);
        //   if (status === orderStatusType.confirmed) {
        //     if (userRole !== UserTypeEnum.ADMIN) {
        //       throw new ApiError(403, ErrorMessages.NOT_PERMITTED);
        //     }
        //     order.status = orderStatusType.confirmed;
        //     await order.save();
        //   }
        //   else if (status === orderStatusType.cancelled) {
        //     if (userRole !== UserTypeEnum.USER) {
        //       throw new ApiError(403, ErrorMessages.NOT_PERMITTED);
        //     }
        //     if (![orderStatusType.under_review, orderStatusType.confirmed].includes(order.status as orderStatusType)) {
        //       throw new ApiError(400, ErrorMessages.NOT_CANCELLED);
        //     }
        //     await updateStock(order.products, productRecord, true);
        //     order.status = orderStatusType.cancelled;
        //     await order.save();
        //   }
        //   else if ([orderStatusType.shipped, orderStatusType.delivered, orderStatusType.ordered, orderStatusType.deleted].includes(status)) {
        //     if (userRole !== UserTypeEnum.ADMIN) {
        //       throw new ApiError(403, ErrorMessages.NOT_PERMITTED);
        //     }
        //   }
        //   if (status === orderStatusType.deleted) {
        //     if (order.status !== orderStatusType.cancelled) {
        //       await updateStock(order.products, productRecord, true);
        //     }
        //   }
        //   order.status = status;
        //   await order.save();
        //   return res.json(new ApiResponse(200, { order }, SuccessMessage.ORDER_UPDATED));
        // });
        // getUserOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        //   const { _id } = req.body.currentUser.userInfo;
        //   const orders = await OrderService.getUserOrders(_id);
        //   return res.json(new ApiResponse(200, { orders }, SuccessMessage.ORDER_FETCHED));
        // });
        // getAllOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        //   const page = parseInt(req.query.page as string);
        //   const { status ,orderId } = req.query;
        //   const { role } = req.body.currentUser.userInfo;
        //   if (role !== UserTypeEnum.ADMIN) {
        //     throw new ApiError(403, ErrorMessages.NOT_PERMITTED);
        //   }
        //   const orders = await OrderService.getAllOrders(page, status as string,orderId as string);
        //   return res.json(new ApiResponse(200, orders, SuccessMessage.ORDER_FETCHED));
        // });
        // getOrderById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        //   const { orderId } = req.params as { orderId: string };
        //   const order = await OrderService.getOrderById(orderId);
        //   if (!order) throw new ApiError(404, ErrorMessages.ORDER_NOT_FOUND);
        //   return res.json(new ApiResponse(200, { order }, SuccessMessage.ORDER_FETCHED));
        // });
    }
}
exports.default = new OrderController();
