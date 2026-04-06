import ICustomer from "../../Model/User/Customer/ICustomerModel";
import CustomerModel from "../../Model/User/Customer/CustomerModel";
export const normalizeEgyptianPhone = (phone: string): string => {
  let normalized = phone.replace(/\s+/g, '');
  if (normalized.startsWith('+2')) normalized = normalized.slice(2);
  else if (normalized.startsWith('2') && normalized.length === 12) normalized = normalized.slice(1);
  return normalized;
};
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