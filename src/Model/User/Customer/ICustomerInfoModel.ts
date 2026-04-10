import { Types } from "mongoose";
import IShipping from "../../Shipping/Ishipping";
export default interface ICustomerInfo {
  customer: Types.ObjectId | string; 
  country?: string;
  firstName: string;
  lastName: string;
  address: string;
  apartmentSuite?: string;
  shipping: string | Types.ObjectId | IShipping;
  postalCode?: string;
  additionalPhone?: string;
  email?: string;
}
