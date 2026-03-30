import ICustomer from "../../Model/User/Customer/ICustomerModel";
import CustomerModel from "../../Model/User/Customer/CustomerModel";
export const identifyCustomer = async (customerData: ICustomer) => {
  let customer = await CustomerModel.findOne({ phone: customerData.phone });
  if (!customer) {
    customer = await CustomerModel.create(customerData);
  }
  return customer;
};
export const updateCustomer = async (_id: string, customerData: ICustomer) => {
    const customer = await CustomerModel.findByIdAndUpdate(_id, customerData, { new: true });
    return customer;
};
export const findCustomerById = async (_id: string) => {
    const customer = await CustomerModel.findById(_id);
    return customer;
}
export const findCustomerByPhone = async (phone: string) => {
    const customer = await CustomerModel.findOne({ phone });
    return customer;
};