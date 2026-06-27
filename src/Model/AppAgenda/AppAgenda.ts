import { Agenda } from "agenda";
import moment, { BeforeDays } from "../../Utils/DateAndTime";
import ProductModel from "../Product/ProductModel";
import { invalidatePattern, CacheKeys } from "../../Utils/Cache/cache";

const appAgenda = async () => {
  const agenda = new Agenda({
    db: {
      address: process.env.DB_URL!,
      collection: "appAgenda",
    }
  } as any);

  agenda.define("update product flags", async () => {
    const thirtyDaysAgo = BeforeDays(moment(), 30);
    await Promise.all([
      ProductModel.updateMany(
        { isDeleted: false, createdAt: { $lt: thirtyDaysAgo }, isNewArrival: true },
        { isNewArrival: false }
      ),
      // bestSeller is sticky: a product earns it once it sells 5+ items and never
      // loses it automatically (returns/cancellations lowering soldItems won't demote it).
      // Products under manual admin control (bestSellerManual) are skipped entirely.
      ProductModel.updateMany(
        { isDeleted: false, soldItems: { $gte: 5 }, bestSellerManual: { $ne: true } },
        { isBestSeller: true }
      ),
      ProductModel.updateMany(
        { isDeleted: false, isSale: true, saleEndDate: { $gt: 0, $lt: moment().valueOf() } },
        [{ $set: { isSale: false, salePrice: 0, saleStartDate: 0, saleEndDate: 0, finalPrice: "$price" } }]
      ),
    ]);
    // These flag/price flips are reflected in the cached home feeds and product
    // listings, so drop the product caches once the nightly sweep finishes.
    await invalidatePattern(CacheKeys.productsPattern);
  });

  await agenda.start();
  await agenda.every("0 0 * * *", "update product flags");

  console.log("All Agendas Started ✅");
};

export default appAgenda;