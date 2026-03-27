import { Router } from "express";
import * as UserController from "../../Controller/User/UserController";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as userValidation from "../../Validation/User/UserInformation";
const userRouter = Router();
userRouter.post(
  "/add-user-information",
  Validation(userValidation.createUser),
  UserController.addUserInformation
);
userRouter.patch(
  "/update-user-information/:_id",
  Validation(userValidation.updateUser),
  UserController.updateUserInformation
);
userRouter.delete(
  "/delete-user-information/:_id",
  Validation(userValidation.userIdValidationSchema),
  UserController.deleteUserInformation
);
userRouter.get(
  "/all-user-Details/:primaryPhone",
  Validation(userValidation.getAllUserInformationRelatedToUser),
  UserController.getAllUserInformationRelatedToUser
);
userRouter.get(
  "/get-one/:_id",
  Validation(userValidation.userIdValidationSchema),
  UserController.getUserInformationById
);
export default userRouter;
