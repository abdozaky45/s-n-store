"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const DbConfig_1 = __importDefault(require("./DbSetup/DbConfig"));
const AppAgenda_1 = __importDefault(require("./Model/AppAgenda/AppAgenda"));
const startServer = async () => {
    await (0, DbConfig_1.default)();
    (0, AppAgenda_1.default)();
};
app_1.app.listen(process.env.PORT, async () => {
    console.log(`server is running on port ${process.env.PORT || 8080}`);
});
startServer();
