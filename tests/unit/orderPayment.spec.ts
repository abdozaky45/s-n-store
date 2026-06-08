import mongoose from "mongoose";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db";
import orderService from "../../src/Service/Order/OrderService";
import OrderModel from "../../src/Model/Order/OrderModel";
import { orderStatusType } from "../../src/Utils/OrderStatusType";
import { paymentStatusType } from "../../src/Utils/PaymentStatusType";
import {
  paymentMethodType,
  paymentTransactionType,
} from "../../src/Utils/PaymentType";
import ErrorMessages from "../../src/Utils/Error";

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

const RECORDER = new mongoose.Types.ObjectId().toString();

// A ledger entry as stored on the order.
const tx = (amount: number, type: paymentTransactionType) => ({
  amount,
  type,
  method: paymentMethodType.cash,
  recordedBy: RECORDER,
  recordedAt: new Date(),
});

// A valid order document with whatever overrides a test needs.
const seedOrder = (overrides: Record<string, unknown> = {}) =>
  OrderModel.create({
    orderNumber: orderService.generateOrderNumber(),
    customer: new mongoose.Types.ObjectId(),
    customerInfo: new mongoose.Types.ObjectId(),
    shipping: new mongoose.Types.ObjectId(),
    products: [
      {
        productId: new mongoose.Types.ObjectId(),
        name: { ar: "منتج", en: "product" },
        variantId: new mongoose.Types.ObjectId(),
        quantity: 1,
        size: "M",
        itemPrice: 100,
        totalPrice: 100,
      },
    ],
    subTotal: 100,
    shippingCost: 20,
    discount: 0,
    totalAmount: 120,
    status: orderStatusType.under_review,
    ...overrides,
  });

describe("syncPaymentState (pure payment-status logic)", () => {
  it("is unpaid with no transactions", () => {
    const order: any = { status: orderStatusType.under_review, totalAmount: 120 };
    orderService.syncPaymentState(order);
    expect(order.payment.totalCollected).toBe(0);
    expect(order.payment.status).toBe(paymentStatusType.unpaid);
  });

  it("is partially_paid when collected is below the total", () => {
    const order: any = {
      status: orderStatusType.under_review,
      totalAmount: 120,
      payment: { transactions: [tx(50, paymentTransactionType.deposit)] },
    };
    orderService.syncPaymentState(order);
    expect(order.payment.totalCollected).toBe(50);
    expect(order.payment.status).toBe(paymentStatusType.partially_paid);
  });

  it("is paid when collected covers the total", () => {
    const order: any = {
      status: orderStatusType.delivered,
      totalAmount: 120,
      payment: { transactions: [tx(120, paymentTransactionType.deposit)] },
    };
    orderService.syncPaymentState(order);
    expect(order.payment.totalCollected).toBe(120);
    expect(order.payment.status).toBe(paymentStatusType.paid);
  });

  it("is refund_pending when a closed order still holds collected money", () => {
    const order: any = {
      status: orderStatusType.cancelled,
      totalAmount: 120,
      payment: { transactions: [tx(50, paymentTransactionType.deposit)] },
    };
    orderService.syncPaymentState(order);
    expect(order.payment.totalCollected).toBe(50);
    expect(order.payment.status).toBe(paymentStatusType.refund_pending);
  });

  it("is refunded once the collected money has been returned", () => {
    const order: any = {
      status: orderStatusType.cancelled,
      totalAmount: 120,
      payment: {
        transactions: [
          tx(50, paymentTransactionType.deposit),
          tx(50, paymentTransactionType.refund),
        ],
      },
    };
    orderService.syncPaymentState(order);
    expect(order.payment.totalCollected).toBe(0);
    expect(order.payment.status).toBe(paymentStatusType.refunded);
  });

  it("nets deposits against refunds and never goes negative", () => {
    const order: any = {
      status: orderStatusType.under_review,
      totalAmount: 200,
      payment: {
        transactions: [
          tx(100, paymentTransactionType.deposit),
          tx(30, paymentTransactionType.refund),
        ],
      },
    };
    orderService.syncPaymentState(order);
    expect(order.payment.totalCollected).toBe(70);
    expect(order.payment.status).toBe(paymentStatusType.partially_paid);
  });
});

describe("recordPayment", () => {
  it("records a deposit and updates the collected total + status", async () => {
    const order = await seedOrder();
    const updated = await orderService.recordPayment(order._id.toString(), {
      amount: 50,
      method: paymentMethodType.instapay,
      recordedBy: RECORDER,
    });
    expect(updated.payment.totalCollected).toBe(50);
    expect(updated.payment.status).toBe(paymentStatusType.partially_paid);
    expect(updated.payment.transactions).toHaveLength(1);
    expect(updated.payment.transactions[0].type).toBe(paymentTransactionType.deposit);
  });

  it("marks the order paid when the deposit covers the full total", async () => {
    const order = await seedOrder();
    const updated = await orderService.recordPayment(order._id.toString(), {
      amount: 120,
      method: paymentMethodType.cash,
      recordedBy: RECORDER,
    });
    expect(updated.payment.status).toBe(paymentStatusType.paid);
  });

  it("rejects a payment above the remaining total (400)", async () => {
    const order = await seedOrder();
    await expect(
      orderService.recordPayment(order._id.toString(), {
        amount: 121,
        method: paymentMethodType.cash,
        recordedBy: RECORDER,
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: ErrorMessages.PAYMENT_EXCEEDS_TOTAL,
    });
  });

  it("rejects payment on a cancelled order (400)", async () => {
    const order = await seedOrder({ status: orderStatusType.cancelled });
    await expect(
      orderService.recordPayment(order._id.toString(), {
        amount: 10,
        method: paymentMethodType.cash,
        recordedBy: RECORDER,
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: ErrorMessages.PAYMENT_NOT_ALLOWED_FOR_STATUS,
    });
  });

  it("rejects payment on an already-settled order (400)", async () => {
    const order = await seedOrder({
      payment: {
        totalCollected: 120,
        status: paymentStatusType.paid,
        transactions: [tx(120, paymentTransactionType.deposit)],
      },
    });
    await expect(
      orderService.recordPayment(order._id.toString(), {
        amount: 10,
        method: paymentMethodType.cash,
        recordedBy: RECORDER,
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: ErrorMessages.PAYMENT_ALREADY_SETTLED,
    });
  });

  it("rejects payment for a non-existent order (404)", async () => {
    await expect(
      orderService.recordPayment(new mongoose.Types.ObjectId().toString(), {
        amount: 10,
        method: paymentMethodType.cash,
        recordedBy: RECORDER,
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      message: ErrorMessages.ORDER_NOT_FOUND,
    });
  });
});

describe("recordRefund", () => {
  it("refunds the collected money and marks the order refunded", async () => {
    const order = await seedOrder({
      status: orderStatusType.cancelled,
      payment: {
        totalCollected: 50,
        status: paymentStatusType.refund_pending,
        transactions: [tx(50, paymentTransactionType.deposit)],
      },
    });
    const updated = await orderService.recordRefund(order._id.toString(), {
      method: paymentMethodType.instapay,
      recordedBy: RECORDER,
    });
    expect(updated.payment.totalCollected).toBe(0);
    expect(updated.payment.status).toBe(paymentStatusType.refunded);
    expect(
      updated.payment.transactions.some(
        (t: any) => t.type === paymentTransactionType.refund && t.amount === 50
      )
    ).toBe(true);
  });

  it("rejects a refund when nothing is pending (400)", async () => {
    const order = await seedOrder();
    await expect(
      orderService.recordRefund(order._id.toString(), {
        method: paymentMethodType.cash,
        recordedBy: RECORDER,
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: ErrorMessages.NO_REFUND_PENDING,
    });
  });

  it("rejects a refund for a non-existent order (404)", async () => {
    await expect(
      orderService.recordRefund(new mongoose.Types.ObjectId().toString(), {
        method: paymentMethodType.cash,
        recordedBy: RECORDER,
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      message: ErrorMessages.ORDER_NOT_FOUND,
    });
  });
});

describe("generateOrderNumber", () => {
  it("produces an ORD-######-#### formatted number", () => {
    expect(orderService.generateOrderNumber()).toMatch(/^ORD-\d{6}-\d{4}$/);
  });
});
