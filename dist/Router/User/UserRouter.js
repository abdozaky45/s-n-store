"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController = __importStar(require("../../Controller/User/UserController"));
const ValidationMiddleware_1 = require("../../middleware/ValidationMiddleware");
const userValidation = __importStar(require("../../Validation/User/UserInformation"));
const baseSchema_1 = require("../../Validation/baseSchema");
const userRouter = (0, express_1.Router)();
userRouter.post("/add-user-information", (0, ValidationMiddleware_1.Validation)(userValidation.createUser), UserController.addUserInformation);
userRouter.patch("/update-user-information/:userId", (0, ValidationMiddleware_1.Validation)(userValidation.updateUser), UserController.updateUserInformation);
userRouter.delete("/delete-user-information/:userId", (0, ValidationMiddleware_1.Validation)(userValidation.CustomUserValidation), UserController.deleteUserInformation);
userRouter.get("/all-user-information", (0, ValidationMiddleware_1.Validation)(baseSchema_1.baseSchema), UserController.getAllUserInformation);
userRouter.get("/user-information", UserController.getUserInformationById);
exports.default = userRouter;
