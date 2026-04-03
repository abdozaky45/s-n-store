"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ShippingModel_1 = __importDefault(require("../../Model/Shipping/ShippingModel"));
class ShippingService {
    async createShipping(ShippingData) {
        const Shipping = await ShippingModel_1.default.create(ShippingData);
        return Shipping;
    }
    async getAllShipping() {
        const Shipping = await ShippingModel_1.default.find().select("-__v");
        return Shipping;
    }
    async getShippingById(ShippingId) {
        const Shipping = await ShippingModel_1.default.findById(ShippingId);
        return Shipping;
    }
    async updateShipping(ShippingId, ShippingData) {
        const Shipping = await ShippingModel_1.default.findByIdAndUpdate(ShippingId, {
            $set: ShippingData
        }, { new: true });
        return Shipping;
    }
    async deleteShipping(ShippingId) {
        const Shipping = await ShippingModel_1.default.findByIdAndDelete(ShippingId);
        return Shipping;
    }
}
exports.default = new ShippingService();
