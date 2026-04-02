import { Router } from 'express';
import * as ShippingController from '../../Controller/Shipping/ShippingController';
import { Validation } from '../../middleware/ValidationMiddleware';
import * as shippingValidation from '../../Validation/Shipping/ShippingValidation';
const PublicShippingRouter = Router();
PublicShippingRouter.get('/', ShippingController.getAllShipping);
PublicShippingRouter.get('/:_id', Validation(shippingValidation.validateShippingByIdUser), ShippingController.getShippingById);
export default PublicShippingRouter;