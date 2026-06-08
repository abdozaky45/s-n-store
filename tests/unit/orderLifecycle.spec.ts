import mongoose from "mongoose";
import { connectTestReplSet, closeTestReplSet } from "../helpers/replset";
import { clearTestDB } from "../helpers/db";
import orderService from "../../src/Service/Order/OrderService";
import OrderModel from "../../src/Model/Order/OrderModel";
import ProductModel from "../../src/Model/Product/ProductModel";
import VariantModel from "../../src/Model/Variant/VariantModel";
import ShippingModel from "../../src/Model/Shipping/ShippingModel";
import CustomerInfoModel from "../../src/Model/User/Customer/CustomerInfoModel";
import { orderStatusType } from "../../src/Utils/OrderStatusType";
import { paymentStatusType } from "../../src/Utils/PaymentStatusType";
import { paymentTransactionType } from "../../src/Utils/PaymentType";

// createOrder / cancelOrder / updateOrderStatus use transactions -> replica set.
beforeAll(connectTestReplSet);
afterEach(clearTestDB);
afterAll(closeTestReplSet);

const seedShipping = (cost = 30) =>
  ShippingModel.create({ name: { ar: "شحن", en: "ship" }, cost });

const seedProduct = (finalPrice = 100) =>
  ProductModel.create({
    name: { ar: "منتج", en: "product" },
    description: { ar: "وصف", en: "desc" },
    price: finalPrice,
    finalPrice,
    soldItems: 0,
    category: new mongoose.Types.ObjectId(),
    createdBy: new mongoose.Types.ObjectId(),
    createdAt: Date.now(),
  });

const seedVariant = (productId: mongoose.Types.ObjectId, quantity = 10, size = "M") =>
  VariantModel.create({ product: productId, size, quantity });

const seedCustomerInfo = (shippingId: mongoose.Types.ObjectId) =>
  CustomerInfoModel.create({
    customer: new mongoose.Types.ObjectId(),
    firstName: "First",
    lastName: "Last",
    address: "123 St",
    shipping: shippingId,
  });

// Wires up shipping + product + variant + customerInfo and returns the ids.
const seedOrderInputs = async (opts: { stock?: number; price?: number; cost?: number } = {}) => {
  const shipping = await seedShipping(opts.cost ?? 30);
  const product = await seedProduct(opts.price ?? 100);
  const variant = await seedVariant(product._id, opts.stock ?? 10);
  const info = await seedCustomerInfo(shipping._id);
  return { shipping, product, variant, info };
};

describe("createOrder", () => {
  it("creates an order, decrements variant stock and bumps product soldItems", async () => {
    const { product, variant, info } = await seedOrderInputs({ stock: 10, price: 100, cost: 30 });

    const order = await orderService.createOrder({
      customerInfo: info._id.toString(),
      customer: info.customer.toString(),
      products: [
        { productId: product._id.toString(), variantId: variant._id.toString(), quantity: 2 },
      ],
    });

    expect(order.subTotal).toBe(200);
    expect(order.shippingCost).toBe(30);
    expect(order.totalAmount).toBe(230);
    expect(order.status).toBe(orderStatusType.under_review);
    expect(order.orderNumber).toMatch(/^ORD-/);

    const v = await VariantModel.findById(variant._id);
    expect(v!.quantity).toBe(8);
    const p = await ProductModel.findById(product._id);
    expect(p!.soldItems).toBe(2);
  });

  it("rejects when stock is insufficient and rolls back (stock unchanged)", async () => {
    const { product, variant, info } = await seedOrderInputs({ stock: 3 });

    await expect(
      orderService.createOrder({
        customerInfo: info._id.toString(),
        customer: info.customer.toString(),
        products: [
          { productId: product._id.toString(), variantId: variant._id.toString(), quantity: 99 },
        ],
      })
    ).rejects.toThrow(/Insufficient stock/);

    // Transaction aborted -> nothing persisted.
    expect(await OrderModel.countDocuments()).toBe(0);
    const v = await VariantModel.findById(variant._id);
    expect(v!.quantity).toBe(3);
    const p = await ProductModel.findById(product._id);
    expect(p!.soldItems).toBe(0);
  });
});

describe("cancelOrder", () => {
  it("restores stock + soldItems and sets status to cancelled", async () => {
    const { product, variant, info } = await seedOrderInputs({ stock: 10 });
    const order = await orderService.createOrder({
      customerInfo: info._id.toString(),
      customer: info.customer.toString(),
      products: [
        { productId: product._id.toString(), variantId: variant._id.toString(), quantity: 2 },
      ],
    });

    const cancelled = await orderService.cancelOrder(order._id.toString());

    expect(cancelled.status).toBe(orderStatusType.cancelled);
    const v = await VariantModel.findById(variant._id);
    expect(v!.quantity).toBe(10);
    const p = await ProductModel.findById(product._id);
    expect(p!.soldItems).toBe(0);
  });

  it("refuses to cancel an order that is not cancellable", async () => {
    const { product, variant, info } = await seedOrderInputs({ stock: 10 });
    const order = await orderService.createOrder({
      customerInfo: info._id.toString(),
      customer: info.customer.toString(),
      products: [
        { productId: product._id.toString(), variantId: variant._id.toString(), quantity: 1 },
      ],
    });
    // Force a non-cancellable status.
    await OrderModel.updateOne({ _id: order._id }, { status: orderStatusType.delivered });

    await expect(orderService.cancelOrder(order._id.toString())).rejects.toThrow(
      /Cannot cancel order/
    );
  });
});

describe("updateOrderStatus", () => {
  it("auto-collects the balance as cash-on-delivery when marked delivered", async () => {
    const { product, variant, info } = await seedOrderInputs({ stock: 10, price: 100, cost: 30 });
    const order = await orderService.createOrder({
      customerInfo: info._id.toString(),
      customer: info.customer.toString(),
      products: [
        { productId: product._id.toString(), variantId: variant._id.toString(), quantity: 2 },
      ],
    });
    const recordedBy = new mongoose.Types.ObjectId().toString();

    const updated = await orderService.updateOrderStatus(
      order._id.toString(),
      orderStatusType.delivered,
      recordedBy
    );

    expect(updated.status).toBe(orderStatusType.delivered);
    expect(updated.payment.totalCollected).toBe(230);
    expect(updated.payment.status).toBe(paymentStatusType.paid);
    expect(
      updated.payment.transactions.some(
        (t: any) => t.type === paymentTransactionType.balance_on_delivery && t.amount === 230
      )
    ).toBe(true);
  });
});
