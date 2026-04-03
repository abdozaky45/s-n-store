"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OrderModel_1 = __importDefault(require("../../Model/Order/OrderModel"));
const mongoose_1 = require("mongoose");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const Offers_1 = __importDefault(require("../../Model/Offers/Offers"));
const OfferType_1 = require("../../Utils/OfferType");
const ShippingModel_1 = __importDefault(require("../../Model/Shipping/ShippingModel"));
const mongoose_2 = __importDefault(require("mongoose"));
const ProductModel_1 = __importDefault(require("../../Model/Product/ProductModel"));
const OrderStatusType_1 = require("../../Utils/OrderStatusType");
const VariantModel_1 = __importDefault(require("../../Model/Variant/VariantModel"));
const VariantService_1 = require("../Variant/VariantService"); // not forget to implement this function in VariantService ,controller and route
class OrderService {
    constructor() {
        this.generateOrderNumber = () => {
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
            return `ORD-${timestamp}-${random}`;
        };
    }
    async calculateOrderOffers(subTotal) {
        const offers = await Offers_1.default.find({ isActive: true })
            .sort({ minOrderAmount: -1 });
        let discount = 0;
        let freeShipping = false;
        let appliedOffer = null;
        for (const offer of offers) {
            if (subTotal >= offer.minOrderAmount) {
                if (offer.type === OfferType_1.OfferTypeEnum.FREE_SHIPPING) {
                    freeShipping = true;
                }
                else if (offer.type === OfferType_1.OfferTypeEnum.FIXED_DISCOUNT) {
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
    }
    ;
    // Create Order (User)
    async createOrder(orderData) {
        const session = await mongoose_2.default.startSession();
        session.startTransaction();
        try {
            const shippingData = await ShippingModel_1.default.findById(orderData.shipping).session(session);
            if (!shippingData) {
                throw new Error("Shipping method not found");
            }
            const variantIds = orderData.products.map((p) => p.variantId);
            const variants = await VariantModel_1.default.find({ _id: { $in: variantIds } })
                .populate({ path: "color", select: "name hex -_id" })
                .session(session);
            if (variants.length !== variantIds.length) {
                throw new Error("Some variants not found");
            }
            const productIds = [...new Set(orderData.products.map((p) => p.productId))];
            const products_db = await ProductModel_1.default.find({ _id: { $in: productIds } })
                .select("name finalPrice")
                .session(session);
            if (products_db.length !== productIds.length) {
                throw new Error("Some products not found");
            }
            for (const item of orderData.products) {
                const variant = variants.find((v) => v._id.toString() === item.variantId);
                if (!variant) {
                    throw new Error(`Variant ${item.variantId} not found`);
                }
                if (variant.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for variant ${item.variantId}. ` +
                        `Available: ${variant.quantity}, Requested: ${item.quantity}`);
                }
            }
            const products = orderData.products.map((p) => {
                const variant = variants.find((v) => v._id.toString() === p.variantId);
                const product = products_db.find((prod) => prod._id.toString() === p.productId);
                return {
                    name: product.name,
                    productId: new mongoose_1.Types.ObjectId(p.productId),
                    variantId: new mongoose_1.Types.ObjectId(p.variantId),
                    quantity: p.quantity,
                    size: variant.size,
                    color: variant.color instanceof mongoose_1.Types.ObjectId
                        ? variant.color
                        : new mongoose_1.Types.ObjectId(variant.color._id),
                    itemPrice: product.finalPrice,
                    totalPrice: product.finalPrice * p.quantity,
                };
            });
            const subTotal = products.reduce((acc, p) => acc + p.totalPrice, 0);
            const { discount, freeShipping, appliedOffer } = await this.calculateOrderOffers(subTotal);
            const finalShippingCost = freeShipping ? 0 : shippingData.cost;
            const totalAmount = subTotal - discount + finalShippingCost;
            const order = await OrderModel_1.default.create([{
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
                    status: OrderStatusType_1.orderStatusType.under_review,
                }], { session });
            const variantUpdates = orderData.products.map((p) => ({
                updateOne: {
                    filter: { _id: p.variantId },
                    update: { $inc: { quantity: -p.quantity } }
                }
            }));
            await VariantModel_1.default.bulkWrite(variantUpdates, { session });
            const productQuantities = orderData.products.reduce((acc, p) => {
                acc[p.productId] = (acc[p.productId] || 0) + p.quantity;
                return acc;
            }, {});
            const productUpdates = Object.entries(productQuantities).map(([productId, quantity]) => ({
                updateOne: {
                    filter: { _id: productId },
                    update: { $inc: { soldItems: quantity } }
                }
            }));
            await ProductModel_1.default.bulkWrite(productUpdates, { session });
            await session.commitTransaction();
            await Promise.all(Object.keys(productQuantities).map((productId) => (0, VariantService_1.updateProductSoldOutStatus)(productId)));
            return order[0];
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    // Track Orders by Customer ID (User)
    async trackOrdersByCustomerId(customerId) {
        const orders = await OrderModel_1.default.find({ customer: customerId })
            .populate({
            path: SchemaTypesReference_1.default.Customer,
            select: "-__v"
        })
            .populate({
            path: SchemaTypesReference_1.default.Shipping,
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
    }
    ;
    // Track Order by orderNumber (User)
    async trackOrderByOrderNumber(orderNumber) {
        const order = await OrderModel_1.default.findOne({ orderNumber })
            .populate({
            path: SchemaTypesReference_1.default.Customer,
            select: "-__v"
        })
            .populate({
            path: SchemaTypesReference_1.default.Shipping,
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
    }
    ;
    // Cancel Order (User)
    async cancelOrder(_id) {
        const session = await mongoose_2.default.startSession();
        session.startTransaction();
        try {
            const order = await OrderModel_1.default.findById(_id).session(session);
            if (!order) {
                throw new Error("Order not found");
            }
            const cancellableStatuses = [
                OrderStatusType_1.orderStatusType.under_review,
                OrderStatusType_1.orderStatusType.confirmed
            ];
            if (!cancellableStatuses.includes(order.status)) {
                throw new Error(`Cannot cancel order. Current status: ${order.status}. ` +
                    `Only orders with status 'underReview' or 'confirmed' can be cancelled.`);
            }
            const variantUpdates = order.products.map((product) => ({
                updateOne: {
                    filter: { _id: product.variantId },
                    update: { $inc: { quantity: product.quantity } }
                }
            }));
            await VariantModel_1.default.bulkWrite(variantUpdates, { session });
            const productQuantities = order.products.reduce((acc, p) => {
                const productId = p.productId.toString();
                acc[productId] = (acc[productId] || 0) + p.quantity;
                return acc;
            }, {});
            const productUpdates = Object.entries(productQuantities).map(([productId, quantity]) => ({
                updateOne: {
                    filter: { _id: productId },
                    update: { $inc: { soldItems: -quantity } }
                }
            }));
            await ProductModel_1.default.bulkWrite(productUpdates, { session });
            order.status = OrderStatusType_1.orderStatusType.cancelled;
            await order.save({ session });
            await session.commitTransaction();
            const productIds = Object.keys(productQuantities);
            await Promise.all(productIds.map(productId => (0, VariantService_1.updateProductSoldOutStatus)(productId)));
            return order;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    ;
    // Get Order Details by ID (Admin)
    async getOrderById(_id) {
        const order = await OrderModel_1.default.findById(_id)
            .populate({ path: SchemaTypesReference_1.default.Customer, select: "-__v" })
            .populate({ path: SchemaTypesReference_1.default.Shipping, select: "-__v" })
            .populate({ path: "products.color", select: "-__v" })
            .populate({ path: "appliedOffers", select: "-__v" })
            .select("-__v");
        return order;
    }
    ;
    // Apply Free Shipping Offer (Admin)
    async applyFreeShipping(_id) {
        const order = await OrderModel_1.default.findById(_id);
        if (!order)
            throw new Error("Order not found");
        const newTotal = order.totalAmount - order.shippingCost;
        const updated = await OrderModel_1.default.findByIdAndUpdate(_id, { freeShipping: true, shippingCost: 0, totalAmount: newTotal }, { new: true }).select("-__v");
        return updated;
    }
    ;
    // Update Order Status (Admin)
    async updateOrderStatus(_id, newStatus) {
        const session = await mongoose_2.default.startSession();
        session.startTransaction();
        try {
            const order = await OrderModel_1.default.findById(_id).session(session);
            if (!order) {
                throw new Error("Order not found");
            }
            const currentStatus = order.status;
            const activeStatuses = [
                OrderStatusType_1.orderStatusType.under_review,
                OrderStatusType_1.orderStatusType.confirmed,
                OrderStatusType_1.orderStatusType.ordered,
                OrderStatusType_1.orderStatusType.shipped,
                OrderStatusType_1.orderStatusType.delivered,
            ];
            const isCurrentActive = activeStatuses.includes(currentStatus);
            const isNewActive = activeStatuses.includes(newStatus);
            let stockAction = 'none';
            if (isCurrentActive && !isNewActive) {
                stockAction = 'restore';
            }
            else if (!isCurrentActive && isNewActive) {
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
                await VariantModel_1.default.bulkWrite(variantUpdates, { session });
                const productQuantities = order.products.reduce((acc, p) => {
                    const productId = p.productId.toString();
                    acc[productId] = (acc[productId] || 0) + p.quantity;
                    return acc;
                }, {});
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
                await ProductModel_1.default.bulkWrite(productUpdates, { session });
            }
            order.status = newStatus;
            await order.save({ session });
            await session.commitTransaction();
            if (stockAction !== 'none') {
                const productIds = [...new Set(order.products.map((p) => p.productId.toString()))];
                await Promise.all(productIds.map(productId => (0, VariantService_1.updateProductSoldOutStatus)(productId)));
            }
            return order;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    ;
    // Get All Orders with Pagination and Filtering (Admin)
    async getAllOrders({ status, orderNumber, page, }) {
        const limit = 10;
        page = !page || page < 1 || isNaN(page) ? 1 : page;
        const skip = limit * (page - 1);
        const query = {};
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
            OrderModel_1.default.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({ path: "customer", select: "-__v" })
                .populate({ path: "shipping", select: "-__v" })
                .populate({ path: "products.color", select: "-__v" })
                .populate({ path: "appliedOffer", select: "-__v" })
                .select("-__v"),
            OrderModel_1.default.countDocuments(query),
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
    async getUserOrders(customerId, page, searchTerm) {
        const limit = 10;
        page = !page || page < 1 || isNaN(page) ? 1 : page;
        const skip = limit * (page - 1);
        const filter = { customer: customerId };
        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.trim();
            filter.orderNumber = {
                $regex: term,
                $options: "i"
            };
        }
        const [orders, totalItems] = await Promise.all([
            OrderModel_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({ path: "shipping", select: "-__v" })
                .populate({ path: "products.color", select: "-__v" })
                .populate({ path: "appliedOffer", select: "-__v" })
                .select("-__v"),
            OrderModel_1.default.countDocuments(filter),
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
exports.default = new OrderService();
