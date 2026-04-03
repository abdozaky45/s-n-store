"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusEnum = exports.statusType = void 0;
var StatusEnum;
(function (StatusEnum) {
    StatusEnum["Online"] = "online";
    StatusEnum["Offline"] = "offline";
    StatusEnum["Deleted"] = "deleted";
    StatusEnum["Blocked"] = "blocked";
})(StatusEnum || (exports.StatusEnum = StatusEnum = {}));
const statusType = Object.values(StatusEnum);
exports.statusType = statusType;
