"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingCategory = exports.ShippingCategoryArray = void 0;
var ShippingCategory;
(function (ShippingCategory) {
    ShippingCategory["CairoAndGiza"] = "Cairo&Giza";
    ShippingCategory["DeltaRegion"] = "Delta Region";
    ShippingCategory["UpperEgypt"] = "Upper Egypt";
})(ShippingCategory || (exports.ShippingCategory = ShippingCategory = {}));
const ShippingCategoryArray = Object.values(ShippingCategory);
exports.ShippingCategoryArray = ShippingCategoryArray;
