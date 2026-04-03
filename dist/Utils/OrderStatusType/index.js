"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStatusType = exports.orderStatusArray = void 0;
var orderStatusType;
(function (orderStatusType) {
    orderStatusType["under_review"] = "under_review";
    orderStatusType["confirmed"] = "confirmed";
    orderStatusType["ordered"] = "ordered";
    orderStatusType["shipped"] = "shipped";
    orderStatusType["delivered"] = "delivered";
    orderStatusType["deleted"] = "deleted";
    orderStatusType["cancelled"] = "cancelled";
})(orderStatusType || (exports.orderStatusType = orderStatusType = {}));
const orderStatusArray = Object.values(orderStatusType);
exports.orderStatusArray = orderStatusArray;
