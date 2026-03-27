import { Types } from "mongoose";
import Iuser from "../../Model/User/UserInformation/Iuser";
import UserModel from "../../Model/User/UserInformation/UserModel";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
export const createUser = async (userData: Iuser) => {
  const user = await UserModel.create(userData);
  return user;
};
export const updateUserInformation = async (_id: Types.ObjectId | string, userData: Iuser) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
   _id,
    { $set: userData },
    { new: true }
  );
  return updatedUser;
};
export const deleteUserInformation = async (_id: Types.ObjectId | string) => {
  const deletedUser = await UserModel.deleteOne({ _id });
  return deletedUser;
};
export const findUserInformationById = async (_id: Types.ObjectId | string) => {
  const user = await UserModel.findById(_id).populate(SchemaTypesReference.Shipping);
  return user;
};
export const fetchUserDetailsByPrimaryPhone = async (primaryPhone: string) => {
  const users = await UserModel.find({ primaryPhone}).populate(SchemaTypesReference.Shipping);
  return users;
};
export const checkIfPrimaryPhoneExists = async (primaryPhone: string) => {
  const user = await UserModel.findOne({ primaryPhone });
  return user;
};