
import joi from "joi";
import { baseSchema } from "../baseSchema";
import { orderStatusArray } from "../../Utils/OrderStatusType";
export const createOrderValidation = joi.object({
  customer: joi.string().required(),
  customerInfo: joi.string().required(),
  products: joi.array().items(
    joi.object({
      productId: joi.string().required(),
      variantId: joi.string().required(),
      quantity: joi.number().min(1).required(),
    })
  ).min(1).required(),
}).required()


export const userOrderIdValidation = joi.object({
  orderId: joi.string().required(),
}).required()

export const AdminOrderIdValidation = baseSchema.concat(
  joi.object({
    orderId: joi.string().required(),
  }).required()
);


export const orderNumberValidation = baseSchema.concat(
  joi.object({
    orderNumber: joi.string().required(),
  }).required()
);

export const customerIdValidation = joi.object({
  customerId: joi.string().required(),
}).required()


export const updateOrderStatusValidation = baseSchema.concat(
  joi.object({
    orderId: joi.string().required(),
    status: joi.string().valid(...orderStatusArray).required(),
  }).required()
);

export const getAllOrdersValidation = baseSchema.concat(
  joi.object({
    status: joi.string().valid(...orderStatusArray).optional(),
    orderNumber: joi.string().optional(),
    page: joi.number().optional(),
  }).required()
);

export const getUserOrdersValidation = joi.object({
  customerId: joi.string().required(),
  page: joi.number().optional(),
  search: joi.string().optional(),
}).required()



























// import joi from 'joi';
// import { orderStatusArray } from '../../Utils/OrderStatusType';
// import { baseSchema } from '../baseSchema';
// export const createOrderValidation = baseSchema.concat(
//     joi.object({
//         products: joi.array().items(
//             joi.object({
//                 productId: joi.string().required(),
//                 quantity: joi.number().required(),
//             })
//         ).required(),
//         userId: joi.string().required(),
//     }).required()
// );
// export const updateOrderStatusValidation = baseSchema.concat(
//     joi.object({
//         orderId: joi.string().required(),
//         status: joi.string().valid(...orderStatusArray).required(),
//     }).required()
// );
// export const getAllOrdersValidation = baseSchema.concat(
//     joi.object({
//         page: joi.number().required(),
//         status: joi.string().optional(),
//         orderId: joi.string().optional(),
//     }).required()
// );
// export const getOrderByIdValidation = baseSchema.concat(
//     joi.object({
//         orderId: joi.string().required(),
//     }).required()
// );

