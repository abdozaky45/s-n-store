import { Agenda } from "agenda";
import moment, { BeforeDays } from "../../Utils/DateAndTime";
import ProductModel from "../Product/ProductModel";

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
      ProductModel.updateMany(
        { isDeleted: false, soldItems: { $gte: 5 } },
        { isBestSeller: true }
      ),
      ProductModel.updateMany(
        { isDeleted: false, soldItems: { $lt: 5 } },
        { isBestSeller: false }
      ),
      ProductModel.updateMany(
        { isDeleted: false, isSale: true, saleEndDate: { $gt: 0, $lt: moment().valueOf() } },
        { isSale: false, salePrice: 0, saleStartDate: 0, saleEndDate: 0, $set: { finalPrice: "$price" } }
      ),
    ]);
  });

  await agenda.start();
  await agenda.every("0 0 * * *", "update product flags");

  console.log("All Agendas Started ✅");
};

export default appAgenda;