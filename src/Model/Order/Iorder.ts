import { Types } from "mongoose";
import IShipping from "../Shipping/Ishipping";
import { IProduct } from "../Product/Iproduct";
import { IOffer } from "../Offers/IOffers";
import ICustomer from "../User/Customer/ICustomerModel";

interface ProductOrder {
  productId: Types.ObjectId | string | IProduct;
  name:{ ar: string; en: string };
  variantId: Types.ObjectId | string;
  quantity: number;
  size: string;
  color?: Types.ObjectId | string;
  itemPrice: number;
  totalPrice: number;
}

interface PaymentReceipt {
  mediaUrl: string;
  mediaId: string;
}

interface PaymentTransaction {
  amount: number;
  type: string;
  method: string;
  note?: string;
  receiptImage?: PaymentReceipt;
  recordedBy: Types.ObjectId | string;
  recordedAt: Date;
}

interface OrderPayment {
  totalCollected: number;
  status: string;
  transactions: PaymentTransaction[];
}

interface IOrder {
  orderNumber: string;
  customer: Types.ObjectId | string | ICustomer;
  customerInfo: Types.ObjectId | string;
  shipping: Types.ObjectId | string | IShipping;
  products: ProductOrder[];
  subTotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  appliedOffer: Types.ObjectId | string | null;
  freeShipping?: boolean;
  status: string;
  payment: OrderPayment;
  // virtual: totalAmount - payment.totalCollected
  remainingAmount?: number;
}

export { IOrder, ProductOrder, OrderPayment, PaymentTransaction, PaymentReceipt };