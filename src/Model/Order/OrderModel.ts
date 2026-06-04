import { model, Schema, Types } from "mongoose";
import { EnumStringRequired, NotRequiredBoolean, RefType, RequiredNumber, RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import { orderStatusArray } from "../../Utils/OrderStatusType";
import { paymentStatusArray, paymentStatusType } from "../../Utils/PaymentStatusType";
import { paymentMethodArray, paymentTransactionArray } from "../../Utils/PaymentType";
import { IOrder } from "./Iorder";

const OrderSchema = new Schema<IOrder>({
  orderNumber: RequiredString,
  customer: RefType(SchemaTypesReference.Customer, true),
  customerInfo: RefType(SchemaTypesReference.CustomerInfo, true),
  shipping: RefType(SchemaTypesReference.Shipping, true),
  products: [{
    _id: false,
    productId: { type: Types.ObjectId, ref: SchemaTypesReference.Product, required: true },
    name: { ar: RequiredString, en: RequiredString },
    variantId: { type: Types.ObjectId, ref: SchemaTypesReference.Variant, required: true },
    quantity: RequiredNumber,
    size: RequiredString,
    color: { type: Types.ObjectId, ref: SchemaTypesReference.Color, required: false },
    itemPrice: RequiredNumber,
    totalPrice: RequiredNumber,
  }],
  subTotal: RequiredNumber,
  shippingCost: RequiredNumber,
  discount: { type: Number, default: 0 },
  totalAmount: RequiredNumber,
  appliedOffer: RefType(SchemaTypesReference.Offer, false),
  freeShipping: NotRequiredBoolean,
  status: EnumStringRequired(orderStatusArray),
  // Optional manual payment tracking (deposit / earnest money handled outside the system).
  payment: {
    totalCollected: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: paymentStatusArray, default: paymentStatusType.unpaid },
    transactions: [{
      _id: false,
      amount: { type: Number, required: true, min: 0 },
      type: { type: String, enum: paymentTransactionArray, required: true },
      method: { type: String, enum: paymentMethodArray, required: true },
      note: { type: String },
      receiptImage: {
        mediaUrl: { type: String },
        mediaId: { type: String },
      },
      recordedBy: { type: Types.ObjectId, ref: SchemaTypesReference.User, required: true },
      recordedAt: { type: Date, default: Date.now },
    }],
  },
}, {
  timestamps: true,
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Always-derived so it never drifts when totalAmount changes (e.g. free-shipping offers).
OrderSchema.virtual("remainingAmount").get(function (this: IOrder) {
  const collected = this.payment?.totalCollected ?? 0;
  return Math.max(0, (this.totalAmount ?? 0) - collected);
});

export default model(SchemaTypesReference.Order, OrderSchema);
