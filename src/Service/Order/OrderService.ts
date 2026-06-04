import { ProductOrder, PaymentTransaction } from "../../Model/Order/Iorder";
import OrderModel from "../../Model/Order/OrderModel";
import { Types } from "mongoose";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import OfferModel from "../../Model/Offers/Offers";
import { OfferTypeEnum } from "../../Utils/OfferType";
import mongoose from "mongoose";
import ProductModel from "../../Model/Product/ProductModel";
import { orderStatusType } from "../../Utils/OrderStatusType";
import { paymentStatusType } from "../../Utils/PaymentStatusType";
import { paymentMethodType, paymentTransactionType } from "../../Utils/PaymentType";
import VariantModel from "../../Model/Variant/VariantModel";
import { getVariantsByIds, updateProductSoldOutStatus } from "../Variant/VariantService"; // not forget to implement this function in VariantService ,controller and route
import IShipping from "../../Model/Shipping/Ishipping";
import { checkCustomerInfo } from "../User/CustomerInfoService";
import ErrorMessages from "../../Utils/Error";
import { ApiError } from "../../Utils/ErrorHandling";
import { extractMediaId } from "../../Shared/MediaServiceShared";
import { getProductsByIds } from "../../Shared/ProductServiceShared";
class OrderService {
  generateOrderNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `ORD-${timestamp}-${random}`;
  };
  // Build a payment ledger entry (deposit / balance-on-delivery / refund).
  buildTransaction = (data: {
    amount: number;
    type: paymentTransactionType;
    method: string;
    note?: string;
    receiptImageUrl?: string;
    recordedBy: string;
  }): PaymentTransaction => {
    const transaction: PaymentTransaction = {
      amount: data.amount,
      type: data.type,
      method: data.method,
      recordedBy: new Types.ObjectId(data.recordedBy),
      recordedAt: new Date(),
    };
    if (data.note) transaction.note = data.note;
    if (data.receiptImageUrl) {
      transaction.receiptImage = {
        mediaUrl: data.receiptImageUrl,
        mediaId: extractMediaId(data.receiptImageUrl),
      };
    }
    return transaction;
  };
  // Ensure the payment object exists on legacy orders created before this feature.
  ensurePayment = (order: any) => {
    if (!order.payment) {
      order.payment = {
        totalCollected: 0,
        status: paymentStatusType.unpaid,
        transactions: [],
      };
    }
  };
  // Recompute net collected + payment status from the transaction ledger and order status.
  syncPaymentState = (order: any) => {
    this.ensurePayment(order);
    const transactions: PaymentTransaction[] = order.payment.transactions ?? [];
    const collected = transactions.reduce((sum, t) => {
      return t.type === paymentTransactionType.refund ? sum - t.amount : sum + t.amount;
    }, 0);
    const netCollected = Math.max(0, collected);
    const hasRefund = transactions.some((t) => t.type === paymentTransactionType.refund);
    const isClosed = [orderStatusType.cancelled, orderStatusType.deleted].includes(order.status);

    let status: paymentStatusType;
    if (hasRefund && netCollected <= 0) {
      status = paymentStatusType.refunded;
    } else if (isClosed && netCollected > 0) {
      status = paymentStatusType.refund_pending;
    } else if (netCollected <= 0) {
      status = paymentStatusType.unpaid;
    } else if (netCollected >= order.totalAmount) {
      status = paymentStatusType.paid;
    } else {
      status = paymentStatusType.partially_paid;
    }
    order.payment.totalCollected = netCollected;
    order.payment.status = status;
  };
  // Record a manual deposit / partial payment received outside the system (Admin).
  recordPayment = async (
    _id: string,
    data: {
      amount: number;
      method: string;
      note?: string;
      receiptImageUrl?: string;
      recordedBy: string;
    }
  ) => {
    const order = await OrderModel.findById(_id);
    if (!order) throw new ApiError(404, ErrorMessages.ORDER_NOT_FOUND);
    if (([orderStatusType.cancelled, orderStatusType.deleted] as string[]).includes(order.status)) {
      throw new ApiError(400, ErrorMessages.PAYMENT_NOT_ALLOWED_FOR_STATUS);
    }
    this.ensurePayment(order);
    const settled: string[] = [
      paymentStatusType.paid,
      paymentStatusType.refund_pending,
      paymentStatusType.refunded,
    ];
    if (settled.includes(order.payment.status)) {
      throw new ApiError(400, ErrorMessages.PAYMENT_ALREADY_SETTLED);
    }
    if (order.payment.totalCollected + data.amount > order.totalAmount) {
      throw new ApiError(400, ErrorMessages.PAYMENT_EXCEEDS_TOTAL);
    }
    order.payment.transactions.push(this.buildTransaction({
      amount: data.amount,
      type: paymentTransactionType.deposit,
      method: data.method,
      note: data.note,
      receiptImageUrl: data.receiptImageUrl,
      recordedBy: data.recordedBy,
    }) as any);
    this.syncPaymentState(order);
    order.markModified("payment");
    await order.save();
    return order;
  };
  // Record that a collected deposit was returned to the customer outside the system (Admin).
  recordRefund = async (
    _id: string,
    data: { method: string; note?: string; receiptImageUrl?: string; recordedBy: string }
  ) => {
    const order = await OrderModel.findById(_id);
    if (!order) throw new ApiError(404, ErrorMessages.ORDER_NOT_FOUND);
    if (!order.payment || order.payment.status !== paymentStatusType.refund_pending) {
      throw new ApiError(400, ErrorMessages.NO_REFUND_PENDING);
    }
    order.payment.transactions.push(this.buildTransaction({
      amount: order.payment.totalCollected,
      type: paymentTransactionType.refund,
      method: data.method,
      note: data.note,
      receiptImageUrl: data.receiptImageUrl,
      recordedBy: data.recordedBy,
    }) as any);
    this.syncPaymentState(order);
    order.markModified("payment");
    await order.save();
    return order;
  };
  async calculateOrderOffers(subTotal: number) {
    const offers = await OfferModel.find({ isActive: true })
      .sort({ minOrderAmount: -1 });
    let discount = 0;
    let freeShipping = false;
    let appliedOffer: Types.ObjectId | null = null;
    for (const offer of offers) {
      if (subTotal >= offer.minOrderAmount) {
        if (offer.type === OfferTypeEnum.FREE_SHIPPING) {
          freeShipping = true;
        } else if (offer.type === OfferTypeEnum.FIXED_DISCOUNT) {
          discount = offer.discountAmount ?? 0;
        }
        appliedOffer = offer._id;
        break;
      }
    }
    return {
      discount,
      freeShipping,
      appliedOffer
    };
  };
  // Create Order (User)
  async createOrder(orderData: {
    customerInfo: string;
    customer: string;
    products: {
      productId: string;
      variantId: string;
      quantity: number;
    }[];
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const CustomerInfo = await checkCustomerInfo(
        orderData.customerInfo,
        orderData.customer,
        session
      );
      if (!CustomerInfo || !CustomerInfo.shipping) {
        throw new Error(ErrorMessages.CUSTOMER_INFO_NOT_FOUND_OR_INVALID);
      }
      const shipping = CustomerInfo.shipping as IShipping;
      const shippingCost = shipping.cost;
      const variantIds = orderData.products.map((p) => p.variantId);
      const variants = await getVariantsByIds(variantIds, session);
      if (variants.length !== variantIds.length) {
        throw new Error(ErrorMessages.VARIANTS_NOT_FOUND);
      }
      const productIds = [...new Set(orderData.products.map((p) => p.productId))];
      const products_db = await getProductsByIds(productIds, session);
      if (products_db.length !== productIds.length) {
        throw new Error(ErrorMessages.PRODUCTS_NOT_FOUND);
      }
      for (const item of orderData.products) {
        const variant = variants.find((v) => v._id.toString() === item.variantId);
        if (!variant) {
          throw new Error(`Variant ${item.variantId} not found`);
        }
        if (variant.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for variant ${item.variantId}. ` +
            `Available: ${variant.quantity}, Requested: ${item.quantity}`
          );
        }
      }
      const products: ProductOrder[] = orderData.products.map((p) => {
        const variant = variants.find((v) => v._id.toString() === p.variantId)!;
        const product = products_db.find((prod) => prod._id.toString() === p.productId)!;

        return {
          name: product.name,
          productId: new Types.ObjectId(p.productId),
          variantId: new Types.ObjectId(p.variantId),
          quantity: p.quantity,
          size: variant.size,
          color: variant.color ? new Types.ObjectId(variant.color.toString()) : undefined,
          itemPrice: product.finalPrice,
          totalPrice: product.finalPrice * p.quantity,
        };
      });
      const subTotal = products.reduce((acc, p) => acc + p.totalPrice, 0);
      const { discount, freeShipping, appliedOffer } =
        await this.calculateOrderOffers(subTotal);
      const finalShippingCost = freeShipping ? 0 : shippingCost;
      const totalAmount = subTotal - discount + finalShippingCost;
      const order = await OrderModel.create([{
        customer: orderData.customer,
        customerInfo: orderData.customerInfo,
        shipping: CustomerInfo.shipping,
        products,
        subTotal,
        shippingCost: finalShippingCost,
        discount,
        totalAmount,
        freeShipping,
        appliedOffer,
        orderNumber: this.generateOrderNumber(),
        status: orderStatusType.under_review,
      }], { session });
      const variantUpdates = orderData.products.map((p) => ({
        updateOne: {
          filter: { _id: p.variantId },
          update: { $inc: { quantity: -p.quantity } }
        }
      }));
      await VariantModel.bulkWrite(variantUpdates, { session });
      const productQuantities = orderData.products.reduce((acc, p) => {
        acc[p.productId] = (acc[p.productId] || 0) + p.quantity;
        return acc;
      }, {} as Record<string, number>);

      const productUpdates = Object.entries(productQuantities).map(([productId, quantity]) => ({
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { soldItems: quantity } }
        }
      }));
      await ProductModel.bulkWrite(productUpdates, { session });
      await session.commitTransaction();
      await Promise.all(
        Object.keys(productQuantities).map((productId) =>
          updateProductSoldOutStatus(productId)
        )
      );
      return order[0];

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  // Get Order Details by ID (Admin)
  async getOrderById(_id: string) {
    const order = await OrderModel.findById(_id)
      .populate({ path: "products.productId", select: "defaultImage albumImages" })
      .populate({ path: SchemaTypesReference.Customer, select: "-_id -__v" })
      .populate({ path: SchemaTypesReference.CustomerInfo, select: "-_id -__v" })
      .populate({ path: SchemaTypesReference.Shipping, select: "-_id -__v" })
      .populate({ path: "products.color", select: "-_id -__v" })
      .select("-__v");
    return order;
  };
  // Get All Orders with Pagination and Filtering (User)
  async getAllUserOrders(
    customerId: string,
    page?: number,
    searchTerm?: string
  ) {
    const limit = 10;
    page = !page || page < 1 || isNaN(page) ? 1 : page;
    const skip = limit * (page - 1);

    const filter: any = { customer: customerId };

    if (searchTerm && searchTerm.trim()) {
      filter.orderNumber = {
        $regex: searchTerm.trim(),
        $options: "i"
      };
    }

    const [orders, totalItems] = await Promise.all([
      OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "products.productId", select: "defaultImage" })
        .populate({ path: "products.color", select: "-_id -__v" })
        .select("products orderNumber status subTotal shippingCost discount totalAmount freeShipping payment createdAt"),
      OrderModel.countDocuments(filter),
    ]);

    return {
      orders,
      currentPage: page,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      searchTerm: searchTerm || null,
    };
  }
  // Cancel Order (User)
  async cancelOrder(_id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await OrderModel.findById(_id).session(session);
      if (!order) {
        throw new Error(ErrorMessages.ORDER_NOT_FOUND);
      }
      const cancellableStatuses = [
        orderStatusType.under_review,
        orderStatusType.confirmed
      ];
      if (!cancellableStatuses.includes(order.status as orderStatusType)) {
        throw new Error(
          `Cannot cancel order. Current status: ${order.status}. ` +
          `Only orders with status 'underReview' or 'confirmed' can be cancelled.`
        );
      }
      const variantUpdates = order.products.map((product) => ({
        updateOne: {
          filter: { _id: product.variantId },
          update: { $inc: { quantity: product.quantity } }
        }
      }));
      await VariantModel.bulkWrite(variantUpdates, { session });
      const productQuantities = order.products.reduce((acc, p) => {
        const productId = p.productId.toString();
        acc[productId] = (acc[productId] || 0) + p.quantity;
        return acc;
      }, {} as Record<string, number>);
      const productUpdates = Object.entries(productQuantities).map(([productId, quantity]) => ({
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { soldItems: -quantity } }
        }
      }));
      await ProductModel.bulkWrite(productUpdates, { session });
      order.status = orderStatusType.cancelled;
      // If a deposit was already collected, flag it for refund (handled by Admin outside the system).
      this.syncPaymentState(order);
      order.markModified("payment");
      await order.save({ session });
      await session.commitTransaction();
      const productIds = Object.keys(productQuantities);
      await Promise.all(
        productIds.map(productId => updateProductSoldOutStatus(productId))
      );

      return order;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };
  // Apply Free Shipping Offer (Admin)
  async applyFreeShipping(_id: string) {
    const order = await OrderModel.findById(_id);
    if (!order) throw new ApiError(404, ErrorMessages.ORDER_NOT_FOUND);
    order.totalAmount = order.totalAmount - order.shippingCost;
    order.shippingCost = 0;
    order.freeShipping = true;
    // Total changed, so the payment status may flip (e.g. a deposit now covers the full amount).
    this.syncPaymentState(order);
    order.markModified("payment");
    await order.save();
    return await OrderModel.findById(_id).select("-__v");
  };
  // Update Order Status (Admin)
  async updateOrderStatus(_id: string, newStatus: string, recordedBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await OrderModel.findById(_id).session(session);
      if (!order) {
        throw new ApiError(404, ErrorMessages.ORDER_NOT_FOUND);
      }
      const currentStatus = order.status;
      const activeStatuses = [
        orderStatusType.under_review,
        orderStatusType.confirmed,
        orderStatusType.ordered,
        orderStatusType.shipped,
        orderStatusType.delivered,
      ];
      const isCurrentActive = activeStatuses.includes(currentStatus as any);
      const isNewActive = activeStatuses.includes(newStatus as any);
      let stockAction: 'restore' | 'deduct' | 'none' = 'none';
      if (isCurrentActive && !isNewActive) {
        stockAction = 'restore';
      } else if (!isCurrentActive && isNewActive) {
        stockAction = 'deduct';
      }
      if (stockAction !== 'none') {
        const variantUpdates = order.products.map((product) => ({
          updateOne: {
            filter: { _id: product.variantId },
            update: {
              $inc: {
                quantity: stockAction === 'restore'
                  ? product.quantity
                  : -product.quantity
              }
            }
          }
        }));
        await VariantModel.bulkWrite(variantUpdates, { session });
        const productQuantities = order.products.reduce((acc, p) => {
          const productId = p.productId.toString();
          acc[productId] = (acc[productId] || 0) + p.quantity;
          return acc;
        }, {} as Record<string, number>);
        const productUpdates = Object.entries(productQuantities).map(([productId, quantity]) => ({
          updateOne: {
            filter: { _id: productId },
            update: {
              $inc: {
                soldItems: stockAction === 'restore'
                  ? -quantity
                  : quantity
              }
            }
          }
        }));
        await ProductModel.bulkWrite(productUpdates, { session });
      }
      this.ensurePayment(order);
      const becameDelivered =
        newStatus === orderStatusType.delivered && currentStatus !== orderStatusType.delivered;
      const leftDelivered =
        currentStatus === orderStatusType.delivered && newStatus !== orderStatusType.delivered;
      if (becameDelivered) {
        // Reaching the customer means the remaining balance was collected cash-on-delivery.
        const remaining = order.totalAmount - order.payment.totalCollected;
        if (remaining > 0) {
          order.payment.transactions.push(this.buildTransaction({
            amount: remaining,
            type: paymentTransactionType.balance_on_delivery,
            method: paymentMethodType.cash,
            recordedBy,
          }) as any);
        }
      } else if (leftDelivered) {
        // Reverting from delivered undoes the auto cash-on-delivery balance.
        order.payment.transactions = order.payment.transactions.filter(
          (t: PaymentTransaction) => t.type !== paymentTransactionType.balance_on_delivery
        ) as any;
      }
      order.status = newStatus;
      this.syncPaymentState(order);
      order.markModified("payment");
      await order.save({ session });
      await session.commitTransaction();
      if (stockAction !== 'none') {
        const productIds = [...new Set(order.products.map((p) => p.productId.toString()))];
        await Promise.all(
          productIds.map(productId => updateProductSoldOutStatus(productId))
        );
      }
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };
  // Get All Orders with Pagination and Filtering (Admin)
  async getAllOrders({
    status,
    orderNumber,
    page,
  }: {
    status?: string;
    orderNumber?: string;
    page?: number;
  }) {
    const limit = 10;
    page = !page || page < 1 || isNaN(page) ? 1 : page;
    const skip = limit * (page - 1);
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (orderNumber && orderNumber.trim()) {
      query.orderNumber = {
        $regex: orderNumber.trim(),
        $options: "i"
      };
    }
    const [orders, totalItems] = await Promise.all([
      OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "products.productId", select: "defaultImage" })
        .populate({ path: SchemaTypesReference.Customer, select: "-_id -__v" })
        .populate({ path: SchemaTypesReference.CustomerInfo, select: "-_id -__v" })
        .populate({ path: SchemaTypesReference.Shipping, select: "-_id -__v" })
        .populate({ path: "products.color", select: "-__v" })
        .select("-__v"),
      OrderModel.countDocuments(query),
    ]);

    return {
      orders,
      currentPage: page,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      filters: {
        status: status || null,
        searchTerm: orderNumber?.trim() || null,
      },
    };
  }
}
export default new OrderService();