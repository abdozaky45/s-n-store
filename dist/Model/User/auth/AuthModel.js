"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../../Utils/Schemas");
const UserType_1 = require("../../../Utils/UserType");
const SchemaTypesReference_1 = __importDefault(require("../../../Utils/Schemas/SchemaTypesReference"));
const userSchema = new mongoose_1.Schema({
    email: Schemas_1.NotRequiredUniqueEmail,
    activeCode: Schemas_1.NotRequiredString,
    role: (0, Schemas_1.EnumStringRole)(UserType_1.userType),
    codeCreatedAt: Schemas_1.NotRequiredTimeStamp,
});
const AuthModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.User, userSchema);
exports.default = AuthModel;
