"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const agenda_1 = require("agenda");
const DateAndTime_1 = __importStar(require("../../Utils/DateAndTime"));
const ProductModel_1 = __importDefault(require("../Product/ProductModel"));
const appAgenda = async () => {
    const agenda = new agenda_1.Agenda({
        db: {
            address: process.env.DB_URL,
            collection: "appAgenda",
        }
    });
    agenda.define("update product flags", async () => {
        const thirtyDaysAgo = (0, DateAndTime_1.BeforeDays)((0, DateAndTime_1.default)(), 30);
        await Promise.all([
            ProductModel_1.default.updateMany({ isDeleted: false, createdAt: { $lt: thirtyDaysAgo }, isNewArrival: true }, { isNewArrival: false }),
            ProductModel_1.default.updateMany({ isDeleted: false, soldItems: { $gte: 5 } }, { isBestSeller: true }),
            ProductModel_1.default.updateMany({ isDeleted: false, soldItems: { $lt: 5 } }, { isBestSeller: false }),
            ProductModel_1.default.updateMany({ isDeleted: false, isSale: true, saleEndDate: { $gt: 0, $lt: (0, DateAndTime_1.default)().valueOf() } }, { isSale: false, salePrice: 0, saleStartDate: 0, saleEndDate: 0, $set: { finalPrice: "$price" } }),
        ]);
    });
    await agenda.start();
    await agenda.every("0 0 * * *", "update product flags");
    console.log("All Agendas Started ✅");
};
exports.default = appAgenda;
