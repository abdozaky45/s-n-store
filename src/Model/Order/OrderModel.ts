import { model, Schema, Types } from "mongoose";
import { EnumStringRequired, NotRequiredBoolean, NotRequiredNumber, RefType, RequiredNumber, RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import { orderStatusArray } from "../../Utils/OrderStatusType";
import { IOrder } from "./Iorder";

const OrderSchema = new Schema<IOrder>({
  user: RefType(SchemaTypesReference.UserInformation, true),
  shipping: RefType(SchemaTypesReference.Shipping, true),
  products: [{
    _id: false,
    productId: { type: Types.ObjectId, ref: SchemaTypesReference.Product, required: true },
    variantId: { type: Types.ObjectId, ref: SchemaTypesReference.Variant, required: true },
    name: RequiredString,
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