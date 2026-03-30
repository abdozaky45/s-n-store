import { Types } from "mongoose";
import IShipping from "../Shipping/Ishipping";
import { IProduct } from "../Product/Iproduct";
import { IOffer } from "../Offers/IOffers";
import ICustomer from "../User/Customer/ICustomerModel";

interface ProductOrder {
  productId: Types.ObjectId | string | IProduct;
  variantId: Types.ObjectId | string;
  name: string;
  quantity: number;
  size: string;
  color: Types.ObjectId | string;
  itemPrice: number;
  totalPrice: number;
}

interface IOrder {
  orderNumber: string;
  customer: Types.ObjectId | string | ICustomer;
  shipping: Types.ObjectId | string | IShipping;
  email?: string;
  products: ProductOrder[];
  subTotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  appliedOffer?: Types.ObjectId | string | IOffer;
  freeShipping?: boolean;
  status: string;
}

export { IOrder, ProductOrder };