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
  color: Types.ObjectId | string;
  itemPrice: number;
  totalPrice: number;
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
}

export { IOrder, ProductOrder };