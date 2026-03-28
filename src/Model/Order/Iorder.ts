import { Types } from "mongoose";
import Iuser from "../User/UserInformation/Iuser";
import IShipping from "../Shipping/Ishipping";
import { IProduct } from "../Product/Iproduct";
import { IOffer } from "../Offers/IOffers";

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
  user: Types.ObjectId | string | Iuser;
  shipping: Types.ObjectId | string | IShipping;
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