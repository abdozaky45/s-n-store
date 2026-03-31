import { IOrder, ProductOrder } from "../../Model/Order/Iorder";
import OrderModel from "../../Model/Order/OrderModel";
import { Types } from "mongoose";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import { IProduct } from "../../Model/Product/Iproduct";
import CustomerInfoModel from "../../Model/User/Customer/CustomerInfoModel";
import OfferModel from "../../Model/Offers/Offers";
import { OfferTypeEnum } from "../../Utils/OfferType";
import ShippingModel from "../../Model/Shipping/ShippingModel";
import mongoose from "mongoose";
import ProductModel from "../../Model/Product/ProductModel";
import { orderStatusType } from "../../Utils/OrderStatusType";
import VariantModel from "../../Model/Variant/VariantModel";
import { updateProductSoldOutStatus } from "../Variant/VariantService";
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
  // ✅ Create Order (User)
  async createOrder(orderData: {
    customer: string;
    shipping: string;
    products: {
      productId: string;
      variantId: string;
      name: string;
      quantity: number;
      size: string;
      color: string;
      itemPrice: number;
    }[];
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const shippingData = await ShippingModel.findById(orderData.shipping).session(session);
      if (!shippingData) {
        throw new Error("Shipping method not found");
      }
      const products: ProductOrder[] = orderData.products.map((p) => ({
        ...p,
        totalPrice: p.itemPrice * p.quantity,
        productId: new Types.ObjectId(p.productId),
        variantId: new Types.ObjectId(p.variantId),
        color: new Types.ObjectId(p.color),
      }));
      const subTotal = products.reduce((acc, p) => acc + p.totalPrice, 0);
      const { discount, freeShipping, appliedOffer } = await this.calculateOrderOffers(subTotal);
      const finalShippingCost = freeShipping ? 0 : shippingData.cost;
      const totalAmount = subTotal - discount + finalShippingCost;
      const order = await OrderModel.create([{
        customer: orderData.customer,
        shipping: orderData.shipping,
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
      const variantUpdates = orderData.products.map((product) => ({
        updateOne: {
          filter: { _id: product.variantId },
          update: { $inc: { quantity: -product.quantity } }
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
      const productIds = Object.keys(productQuantities);
      await Promise.all(
        productIds.map(productId => updateProductSoldOutStatus(productId))
      );
      return order[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };
  // ✅ Track Orders by Customer ID (User)
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
  // ✅ Track Order by orderNumber (User)
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
  // ✅ Cancel Order (User)
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
  // ✅ Get Order Details by ID (Admin)
   async getOrderById(_id: string) {
    const order = await OrderModel.findById(_id)
      .populate({ path: SchemaTypesReference.Customer, select: "-__v" })
      .populate({ path: SchemaTypesReference.Shipping, select: "-__v" })
      .populate({ path: "products.color", select: "-__v" })
      .populate({ path: "appliedOffers", select: "-__v" })
      .select("-__v");
    return order;
  };
  // ✅ Apply Free Shipping Offer (Admin)
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
  // ✅ Update Order Status (Admin)
  async updateOrderStatus(_id: string, status: string) {
    const order = await OrderModel.findByIdAndUpdate(
      _id,
      { status },
      { new: true }
    ).select("-__v");
    return order;
  };
  // ✅ Get All Orders with Pagination and Filtering (Admin)
  // ✅ Get All Orders with Pagination and Filtering (User)
 
















  // async getAllOrders(page: number, status?: string, orderId?: string) {
  //   let limit = 20;
  //   page = !page || page < 1 || isNaN(page) ? 1 : page;
  //   const skip = limit * (page - 1);
  //   const filter: any = {};
  //   if (status) {
  //     filter.status = status;
  //   }
  //   if (orderId) {
  //     filter.$expr = {
  //       $regexMatch: {
  //         input: { $toString: "$_id" },
  //         regex: orderId + "$",
  //       },
  //     };
  //   }
  //   const totalItems = await OrderModel.countDocuments(filter);
  //   const totalPages = Math.ceil(totalItems / limit);
  //   const orders = await OrderModel.find(filter)
  //     .populate([
  //       { path: SchemaTypesReference.Shipping, select: "-_id category cost" },
  //       {
  //         path: SchemaTypesReference.UserInformation,
  //         select:
  //           "-_id firstName lastName country address primaryPhone governorate",
  //       },
  //       {
  //         path: "products.productId",
  //         select: "defaultImage",
  //       },
  //     ])
  //     .skip(skip)
  //     .limit(limit)
  //     .sort({ createdAt: -1 })
  //     .exec();

  //   return { totalItems, totalPages, currentPage: page, orders };
  // }
  // async getOrderById(orderId: Types.ObjectId | string) {
  //   return OrderModel.findById(orderId).populate([
  //     { path: 'products.productId', select: 'productName defaultImage' },
  //     { path: 'products.variantId', select: 'color images' },
  //     { path: 'products.color', select: 'name hex' },
  //     { path: SchemaTypesReference.Shipping, select: 'category cost' },
  //     { path: 'user', select: 'firstName lastName primaryPhone address governorate country' },
  //   ]);
  // }
  // async updateStock(
  //   orderProducts: ProductOrder[],
  //   productRecord: Record<string, IProduct>,
  //   increaseStock: boolean
  // ) {
  //   for (const orderProduct of orderProducts) {
  //     const product = productRecord[orderProduct.productId.toString()];
  //     if (product && orderProduct.quantity !== undefined) {
  //       const quantityChange = increaseStock
  //         ? orderProduct.quantity
  //         : -orderProduct.quantity;
  //       product.soldItems = (product.soldItems ?? 0) - quantityChange;
  //       product.availableItems = (product.availableItems ?? 0) + quantityChange;
  //       try {
  //         await (product as any).save();
  //       } catch (error) {
  //         console.error("Error saving product:", error);
  //       }
  //     }
  //   }
  // }
  
  //    async getAllUsersOrders(customer: string) {
  //   return OrderModel.find({ customer })
  //     .populate([
  //       { path: 'products.productId', select: 'productName defaultImage' },
  //       { path: 'products.variantId', select: 'color images' },
  //       { path: 'products.color', select: 'name hex' },
  //       { path: SchemaTypesReference.Shipping, select: 'category cost' },
  //     ])
  //     .sort({ createdAt: -1 });
  // }

}

export default new OrderService();
