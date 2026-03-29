import { Types } from "mongoose";
export default interface ICustomerInfo {
  customer: Types.ObjectId | string; 
  country?: string;
  firstName: string;
  lastName: string;
  address: string;
  apartmentSuite?: string;
  shipping: string | Types.ObjectId;
  postalCode?: string;
  additionalPhone?: string;
}
