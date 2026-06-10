import { Types, ClientSession } from "mongoose";
import ICustomerInfo from "../../Model/User/Customer/ICustomerInfoModel";
import CustomerInfoModel from "../../Model/User/Customer/CustomerInfoModel";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import IShipping from "../../Model/Shipping/Ishipping";
export const createCutsomerInfo = async (userData: ICustomerInfo) => {
  const user = await CustomerInfoModel.create(userData);
  return user;
};
export const updateCutsomerInfo = async (_id: Types.ObjectId | string, customerData: Partial<ICustomerInfo>) => {
  // Order snapshots are immutable history — never let the public update
  // endpoint touch them (or resurrect a soft-deleted address).
  const updatedUser = await CustomerInfoModel.findOneAndUpdate(
    { _id, isDeleted: { $ne: true }, isOrderSnapshot: { $ne: true } },
    { $set: customerData },
    { new: true }
  );
  return updatedUser;
};
export const deleteCutsomerInfo = async (_id: Types.ObjectId | string) => {
  // Soft delete: orders reference this doc, so removing it would break
  // populate on their history. Snapshots are not deletable.
  const deletedUser = await CustomerInfoModel.findOneAndUpdate(
    { _id, isDeleted: { $ne: true }, isOrderSnapshot: { $ne: true } },
    { $set: { isDeleted: true } },
    { new: true }
  );
  return deletedUser;
};
export const getCustomerInfoById = async (_id: Types.ObjectId | string) => {
  // Snapshots stay readable here: order confirmation emails look the order's
  // customerInfo (a snapshot) up through this function.
  const user = await CustomerInfoModel.findOne({ _id, isDeleted: { $ne: true } })
  .populate(SchemaTypesReference.Shipping)
  .populate(SchemaTypesReference.Customer);
  return user;
};
export const gitCutsomerInfoByCustomerId = async (customer: string | Types.ObjectId) => {
  const users = await CustomerInfoModel.find({
    customer,
    isDeleted: { $ne: true },
    isOrderSnapshot: { $ne: true },
  });
  return users;
};
export const checkIfPrimaryPhoneExists = async (customer: string | Types.ObjectId) => {
  const user = await CustomerInfoModel.findOne({
    customer,
    isDeleted: { $ne: true },
    isOrderSnapshot: { $ne: true },
  });
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
    isDeleted: { $ne: true },
    isOrderSnapshot: { $ne: true },
  })
    .populate(SchemaTypesReference.Shipping)
    .session(session || null)
    .lean();
};
// Clones a customer's address at checkout so the order points at an immutable
// copy — later edits/deletes of the live address can't rewrite order history.
export const createOrderAddressSnapshot = async (
  info: ICustomerInfo & { _id?: Types.ObjectId },
  session: ClientSession
) => {
  const shipping = info.shipping as IShipping & { _id?: Types.ObjectId };
  const [snapshot] = await CustomerInfoModel.create(
    [{
      customer: info.customer,
      country: info.country,
      firstName: info.firstName,
      lastName: info.lastName,
      address: info.address,
      apartmentSuite: info.apartmentSuite,
      // checkCustomerInfo returns shipping populated; store the ref only.
      shipping: shipping?._id ?? info.shipping,
      postalCode: info.postalCode,
      additionalPhone: info.additionalPhone,
      email: info.email,
      isOrderSnapshot: true,
    }],
    { session }
  );
  return snapshot;
};
