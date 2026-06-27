import IShipping from "../../Model/Shipping/Ishipping";
import ShippingModel from "../../Model/Shipping/ShippingModel";
import { Types } from "mongoose";
import { getOrSet, invalidatePattern, CacheKeys } from "../../Utils/Cache/cache";

class ShippingService {
    // Drop the cached shipping list right after any write so the next request
    // reloads fresh rates from the DB.
    private bust() {
        return invalidatePattern(CacheKeys.shippingPattern);
    }
    async createShipping(ShippingData: IShipping) {
        const Shipping = await ShippingModel.create(ShippingData);
        await this.bust();
        return Shipping;
    }
    async getAllShipping() {
        return getOrSet(
            CacheKeys.shippingAll,
            () => ShippingModel.find().sort({ createdAt: -1 }).select("-__v"),
            1800 // 30 min
        );
    }
    async getShippingById(ShippingId: Types.ObjectId | string): Promise<(IShipping & { _id: Types.ObjectId }) | null> {
        const Shipping = await ShippingModel.findById(ShippingId);
        return Shipping;
    }
    async updateShipping(ShippingId: Types.ObjectId | string, ShippingData: Partial<IShipping>) {
        const Shipping = await ShippingModel.findByIdAndUpdate(ShippingId, {
            $set: ShippingData
        }, { new: true }
        );
        await this.bust();
        return Shipping;
    }
    async deleteShipping(ShippingId: Types.ObjectId | string) {
        const Shipping = await ShippingModel.findByIdAndDelete(ShippingId);
        await this.bust();
        return Shipping;
    }
    async checkShippingExists(ShippingId: Types.ObjectId | string) {
        return await ShippingModel.findById(ShippingId);
    }
}
export default new ShippingService();
