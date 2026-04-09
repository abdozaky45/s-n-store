import { ProductOrder } from "../../Model/Order/Iorder";
import OrderModel from "../../Model/Order/OrderModel";
import { Types } from "mongoose";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import OfferModel from "../../Model/Offers/Offers";
import { OfferTypeEnum } from "../../Utils/OfferType";
import ShippingModel from "../../Model/Shipping/ShippingModel";
import mongoose from "mongoose";
import ProductModel from "../../Model/Product/ProductModel";
import { orderStatusType } from "../../Utils/OrderStatusType";
import VariantModel from "../../Model/Variant/VariantModel";
import { updateProductSoldOutStatus } from "../Variant/VariantService"; // not forget to implement this function in VariantService ,controller and route
import CustomerInfoModel from "../../Model/User/Customer/CustomerInfoModel";
import IShipping from "../../Model/Shipping/Ishipping";
import { checkCustomerInfo } from "../User/CustomerInfoService";
import ErrorMessages from "../../Utils/Error";
import { getProductsByIds } from "../../Shared/ProductServiceShared";
class OrderService {
  generateOrderNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `ORD-${timestamp}-${random}`;
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
      const variants = await VariantModel.find({ _id: { $in: variantIds } })
        .populate({ path: SchemaTypesReference.Color, select: "name hex -_id" })
        .session(session);
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
          color: variant.color instanceof Types.ObjectId
            ? variant.color
            : new Types.ObjectId((variant.color as any)._id),
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
  // Track Orders by Customer ID (User)
  async trackOrdersByCustomerId(customerId: string) {
    const orders = await OrderModel.find({ customer: customerId })
      .populate({
        path: SchemaTypesReference.Customer,
        select: "-__v"
      })
      .populate({
        path: SchemaTypesReference.Shipping,
        select: "-__v"
      })
      .populate({
        path: "products.color",
        select: "-__v"
      })
      .populate({
        path: "appliedOffer",
        select: "-__v"
      })
      .select("-__v")
      .sort({ createdAt: -1 });

    return orders;
  };
  // Track Order by orderNumber (User)
  async trackOrderByOrderNumber(orderNumber: string) {
    const order = await OrderModel.findOne({ orderNumber })
      .populate({
        path: SchemaTypesReference.Customer,
        select: "-__v"
      })
      .populate({
        path: SchemaTypesReference.Shipping,
        select: "-__v"
      })
      .populate({
        path: "products.color",
        select: "-__v"
      })
      .populate({
        path: "appliedOffer",
        select: "-__v"
      })
      .select("-__v");

    return order;
  };
  // Cancel Order (User)
  async cancelOrder(_id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await OrderModel.findById(_id).session(session);
      if (!order) {
        throw new Error("Order not found");
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
  // Get Order Details by ID (Admin)
  async getOrderById(_id: string) {
    const order = await OrderModel.findById(_id)
      .populate({ path: SchemaTypesReference.Customer, select: "-__v" })
      .populate({ path: SchemaTypesReference.Shipping, select: "-__v" })
      .populate({ path: "products.color", select: "-__v" })
      .populate({ path: "appliedOffers", select: "-__v" })
      .select("-__v");
    return order;
  };
  // Apply Free Shipping Offer (Admin)
  async applyFreeShipping(_id: string) {
    const order = await OrderModel.findById(_id);
    if (!order) throw new Error("Order not found");
    const newTotal = order.totalAmount - order.shippingCost;
    const updated = await OrderModel.findByIdAndUpdate(
      _id,
      { freeShipping: true, shippingCost: 0, totalAmount: newTotal },
      { new: true }
    ).select("-__v");
    return updated;
  };
  // Update Order Status (Admin)
  async updateOrderStatus(_id: string, newStatus: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await OrderModel.findById(_id).session(session);
      if (!order) {
        throw new Error("Order not found");
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
      order.status = newStatus;
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
        .populate({ path: "customer", select: "-__v" })
        .populate({ path: "shipping", select: "-__v" })
        .populate({ path: "products.color", select: "-__v" })
        .populate({ path: "appliedOffer", select: "-__v" })
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
        orderNumber: orderNumber?.trim() || null,
      },
    };
  }
  // Get All Orders with Pagination and Filtering (User)
  async getUserOrders(
    customerId: string,
    page?: number,
    searchTerm?: string
  ) {
    const limit = 10;
    page = !page || page < 1 || isNaN(page) ? 1 : page;
    const skip = limit * (page - 1);

    const filter: any = { customer: customerId };

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim();


      filter.orderNumber = {
        $regex: term,
        $options: "i"
      };
    }

    const [orders, totalItems] = await Promise.all([
      OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "shipping", select: "-__v" })
        .populate({ path: "products.color", select: "-__v" })
        .populate({ path: "appliedOffer", select: "-__v" })
        .select("-__v"),
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
}
export default new OrderService();