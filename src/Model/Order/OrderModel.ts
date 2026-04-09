import { model, Schema, Types } from "mongoose";
import { EnumStringRequired, NotRequiredBoolean, NotRequiredNumber, NotRequiredString, NotRequiredUniqueEmail, RefType, RequiredNumber, RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import { orderStatusArray } from "../../Utils/OrderStatusType";
import { IOrder } from "./Iorder";

const OrderSchema = new Schema<IOrder>({
  orderNumber: RequiredString,
  customer: RefType(SchemaTypesReference.Customer, true),
  customerInfo: RefType(SchemaTypesReference.CustomerInfo, true),
  shipping: RefType(SchemaTypesReference.Shipping, true),
  email:NotRequiredString,
  products: [{
    _id: false,
    productId: { type: Types.ObjectId, ref: SchemaTypesReference.Product, required: true },
    name: { ar: RequiredString, en: RequiredString },
    variantId: { type: Types.ObjectId, ref: SchemaTypesReference.Variant, required: true },
    quantity: RequiredNumber,
    size: RequiredString,
    color: { type: Types.ObjectId, ref: SchemaTypesReference.Color, required: true },
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
}, { timestamps: true });

export default model(SchemaTypesReference.Order, OrderSchema);