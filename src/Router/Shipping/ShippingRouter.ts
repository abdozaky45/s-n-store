import { Router } from 'express';
import * as ShippingController from '../../Controller/Shipping/ShippingController';
import { Validation } from '../../middleware/ValidationMiddleware';
import * as shippingValidation from '../../Validation/Shipping/ShippingValidation';
const shippingRouter = Router();
shippingRouter.post(
    '/',
    Validation(shippingValidation.createShipping),
    ShippingController.createShipping
);

shippingRouter.get(
    '/:_id',
    Validation(shippingValidation.validateShippingByIdAdmin),
    ShippingController.getShippingById
);
shippingRouter.get(
    '/',
    ShippingController.getAllShipping
);
shippingRouter.patch(
    '/:_id',
    Validation(shippingValidation.updateShipping),
    ShippingController.updateShipping
);
shippingRouter.delete(
    '/:_id',
    Validation(shippingValidation.validateShippingByIdAdmin),
    ShippingController.deleteShipping
);

export default shippingRouter;
