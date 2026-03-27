import { Types } from "mongoose";
export default interface Iuser {
  country?: string;
  firstName: string;
  lastName: string;
  address: string;
  apartmentSuite?: string;
  shipping: string | Types.ObjectId;
  postalCode?: string;
  primaryPhone: string;
  secondaryPhone?: string;
}
