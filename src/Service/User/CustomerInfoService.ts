import { Types, ClientSession } from "mongoose";
import ICustomerInfo from "../../Model/User/Customer/ICustomerInfoModel";
import CustomerInfoModel from "../../Model/User/Customer/CustomerInfoModel";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
export const createCutsomerInfo = async (userData: ICustomerInfo) => {
  const user = await CustomerInfoModel.create(userData);
  return user;
};
export const updateCutsomerInfo = async (_id: Types.ObjectId | string, customerData: Partial<ICustomerInfo>) => {
  const updatedUser = await CustomerInfoModel.findByIdAndUpdate(
   _id,
    { $set: customerData },
    { new: true }
  );
  return updatedUser;
};
export const deleteCutsomerInfo = async (_id: Types.ObjectId | string) => {
  const deletedUser = await CustomerInfoModel.findByIdAndDelete(_id);
  return deletedUser;
};
export const getCustomerInfoById = async (_id: Types.ObjectId | string) => {
  const user = await CustomerInfoModel.findById(_id)
  .populate(SchemaTypesReference.Shipping)
  .populate(SchemaTypesReference.Customer);
  return user;
};
export const gitCutsomerInfoByCustomerId = async (customer: string | Types.ObjectId) => {
  const users = await CustomerInfoModel.find({ customer });
  return users;
};
export const checkIfPrimaryPhoneExists = async (customer: string | Types.ObjectId) => {
  const user = await CustomerInfoModel.findOne({ customer });
  return user;
};
export const checkCustomerInfo = async (
  _id: Types.ObjectId | string,
  customer: string | Types.ObjectId,
  session?: ClientSession
) => {
  return await CustomerInfoModel.findOne({
    _id,
    customer,
  })
    .populate(SchemaTypesReference.Shipping)
    .session(session || null)
    .lean();
};