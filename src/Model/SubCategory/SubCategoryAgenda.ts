import { Agenda } from "agenda";
import moment, { BeforeDays } from "../../Utils/DateAndTime";
import SubCategoryModel from "./SubCategoryModel";

const startSubCategoryAgenda = async () => {
    const agenda = new Agenda({
        db: {
            address: process.env.DB_URL!,
            collection: 'subCategoryAgenda'
        }
    } as any);
    agenda.define('update sub category new arrival', async () => {
        const thirtyDaysAgo = BeforeDays(moment(), 30);
        await SubCategoryModel.updateMany({
            createdAt: { $lt: thirtyDaysAgo },
            isNewArrival: true,
            isDeleted: false
        },
            { isNewArrival: false }
        );

    });
    await agenda.start();
    console.log("SubCategory Agenda Started ✅");
    await agenda.every("0 0 * * *", "update sub category new arrival");
};

export default startSubCategoryAgenda;