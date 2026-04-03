"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferTypeEnum = exports.offerTypeArray = void 0;
var OfferTypeEnum;
(function (OfferTypeEnum) {
    OfferTypeEnum["FREE_SHIPPING"] = "free_shipping";
    OfferTypeEnum["FIXED_DISCOUNT"] = "fixed_discount";
})(OfferTypeEnum || (exports.OfferTypeEnum = OfferTypeEnum = {}));
const offerTypeArray = Object.values(OfferTypeEnum);
exports.offerTypeArray = offerTypeArray;
