import { Types } from "mongoose";
import ICustomerInfo from "../../Model/User/Customer/ICustomerInfoModel";
import CustomerInfoModel from "../../Model/User/Customer/CustomerInfoModel";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
export const createCutsomerInfo = async (userData: ICustomerInfo) => {
  const user = await CustomerInfoModel.create(userData);
  return user;
};
export const updateCutsomerInfo = async (_id: Types.ObjectId | string, userData: ICustomerInfo) => {
  const updatedUser = await CustomerInfoModel.findByIdAndUpdate(
   _id,
    { $set: userData },
    { new: true }
  );
  return updatedUser;
};
export const deleteCutsomerInfo = async (customer: Types.ObjectId | string) => {
  const deletedUser = await CustomerInfoModel.findOneAndDelete({ customer });
  return deletedUser;
};
export const findCutsomerInfoById = async (_id: Types.ObjectId | string) => {
  const user = await CustomerInfoModel.findById(_id).populate(SchemaTypesReference.Shipping);
  return user;
};
export const findCutsomerInfoByCustomerId = async (customer: string | Types.ObjectId) => {
  const users = await CustomerInfoModel.find({ customer }).populate(SchemaTypesReference.Shipping);
  return users;
};
export const checkIfPrimaryPhoneExists = async (customer: string | Types.ObjectId) => {
  const user = await CustomerInfoModel.findOne({ customer });
  return user;
};