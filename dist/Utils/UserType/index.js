"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTypeEnum = exports.userType = void 0;
var UserTypeEnum;
(function (UserTypeEnum) {
    UserTypeEnum["ADMIN"] = "admin";
    UserTypeEnum["USER"] = "user";
})(UserTypeEnum || (exports.UserTypeEnum = UserTypeEnum = {}));
const userType = Object.values(UserTypeEnum);
exports.userType = userType;
