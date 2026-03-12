import { Agenda } from "agenda";
import moment, { BeforeDays } from "../../Utils/DateAndTime";
import CategoryModel from "./CategoryModel";

const startCategoryAgenda = async () => {
    const agenda = new Agenda({
        db: {
            address: process.env.DB_URL!,
            collection: 'categoryAgenda'
        }
    } as any);
    agenda.define('update category new arrival', async () => {
        const thirtyDaysAgo = BeforeDays(moment(), 30);
        await CategoryModel.updateMany({
            createdAt: { $lt: thirtyDaysAgo },
            isNewArrival: true,
            isDeleted: false
        },
            { isNewArrival: false }
        );

    });
    await agenda.start();
    console.log("Category Agenda Started ✅");
    await agenda.every("0 0 * * *", "update category new arrival");
}
export default startCategoryAgenda;