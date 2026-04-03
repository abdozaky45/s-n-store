"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CategoryAgenda_1 = __importDefault(require("../../Model/Category/CategoryAgenda"));
const SubCategoryAgenda_1 = __importDefault(require("../../Model/SubCategory/SubCategoryAgenda"));
const startAgendas = () => {
    (0, CategoryAgenda_1.default)();
    (0, SubCategoryAgenda_1.default)();
};
exports.default = startAgendas;
