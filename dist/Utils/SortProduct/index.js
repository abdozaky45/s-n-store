"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortProductEnum = exports.sortProduct = void 0;
var sortProductEnum;
(function (sortProductEnum) {
    sortProductEnum["newest"] = "Newest";
    sortProductEnum["priceLowToHigh"] = "Low to High";
    sortProductEnum["priceHighToLow"] = "High to Low";
    sortProductEnum["priceUnder100"] = "Under $100";
    sortProductEnum["priceBetween100and500"] = "$100 - $500";
    sortProductEnum["priceBetween500and1000"] = "$500 - $1000";
    sortProductEnum["priceAbove1000"] = "Above $1000";
})(sortProductEnum || (exports.sortProductEnum = sortProductEnum = {}));
const sortProduct = Object.values(sortProductEnum);
exports.sortProduct = sortProduct;
