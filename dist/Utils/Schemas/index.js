"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumStringRole = exports.EnumStringStatus = exports.EnumStringNotRequired = exports.EnumStringRequired = exports.StringValidation = exports.RefType = exports.RequiredSpecificNumber = exports.ImageSlider = exports.ImageSchema = exports.RequiredDefaultStringCity = exports.expiresAtTokenModel = exports.createdAtTokenModel = exports.RequiredUniquePhone = exports.NotRequiredUniqueEmail = exports.RequiredUniqueEmail = exports.NotRequiredTimeStamp = exports.RequiredUniqueNumber = exports.RequiredUniqueString = exports.NotRequiredNumber = exports.RequiredNumber = exports.NotRequiredBoolean = exports.RequiredBooleanDefaultTrue = exports.RequiredBoolean = exports.NotRequiredString = exports.RequiredDefaultStringSize = exports.RequiredString = void 0;
exports.paginate = paginate;
const mongoose_1 = require("mongoose");
const DateAndTime_1 = __importDefault(require("../DateAndTime"));
const DeviceType_1 = require("../DeviceType");
const RequiredString = {
    type: String,
    required: true,
};
exports.RequiredString = RequiredString;
const RequiredUniqueString = {
    type: String,
    required: true,
    unique: true,
};
exports.RequiredUniqueString = RequiredUniqueString;
const RequiredDefaultStringCity = {
    type: String,
    default: "Egypt",
    required: true
};
exports.RequiredDefaultStringCity = RequiredDefaultStringCity;
const RequiredDefaultStringSize = {
    type: String,
    default: "one Size",
    required: true
};
exports.RequiredDefaultStringSize = RequiredDefaultStringSize;
const RequiredUniqueEmail = {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    set: (email) => email.toLowerCase(),
};
exports.RequiredUniqueEmail = RequiredUniqueEmail;
const NotRequiredUniqueEmail = {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    set: (email) => email.toLowerCase(),
};
exports.NotRequiredUniqueEmail = NotRequiredUniqueEmail;
const RequiredUniquePhone = {
    type: String,
    required: true,
    trim: true,
};
exports.RequiredUniquePhone = RequiredUniquePhone;
const NotRequiredString = {
    type: String,
    default: "",
};
exports.NotRequiredString = NotRequiredString;
const RequiredBoolean = {
    type: Boolean,
    required: true,
    default: false,
};
exports.RequiredBoolean = RequiredBoolean;
const RequiredBooleanDefaultTrue = {
    type: Boolean,
    required: true,
    default: true,
};
exports.RequiredBooleanDefaultTrue = RequiredBooleanDefaultTrue;
const NotRequiredBoolean = {
    type: Boolean,
    required: false,
    default: false,
};
exports.NotRequiredBoolean = NotRequiredBoolean;
const RequiredNumber = {
    type: Number,
    required: true,
};
exports.RequiredNumber = RequiredNumber;
const NotRequiredTimeStamp = {
    type: Number,
    required: false,
};
exports.NotRequiredTimeStamp = NotRequiredTimeStamp;
const RequiredUniqueNumber = {
    type: Number,
    required: true,
    unique: true,
};
exports.RequiredUniqueNumber = RequiredUniqueNumber;
const NotRequiredNumber = {
    type: Number,
    default: 0,
};
exports.NotRequiredNumber = NotRequiredNumber;
const createdAtTokenModel = {
    type: Date,
    default: () => (0, DateAndTime_1.default)().toDate(),
};
exports.createdAtTokenModel = createdAtTokenModel;
const expiresAtTokenModel = {
    type: Date,
    default: () => (0, DateAndTime_1.default)().add(365, "days").toDate(),
};
exports.expiresAtTokenModel = expiresAtTokenModel;
const ImageSchema = {
    mediaUrl: { type: String, required: true },
    mediaId: { type: String, required: true },
};
exports.ImageSchema = ImageSchema;
const RequiredSpecificNumber = (specificNumber) => {
    return {
        type: Number,
        required: true,
        default: specificNumber,
    };
};
exports.RequiredSpecificNumber = RequiredSpecificNumber;
const RefType = (ref, required) => {
    return {
        type: mongoose_1.Schema.Types.ObjectId,
        required,
        ref,
        default: null,
    };
};
exports.RefType = RefType;
const StringValidation = (validation, message) => {
    return {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return validation.test(v);
            },
            message,
        },
    };
};
exports.StringValidation = StringValidation;
const EnumStringRequired = (enumValues, index = 0) => {
    return {
        type: String,
        required: true,
        enum: enumValues,
        default: enumValues[index],
    };
};
exports.EnumStringRequired = EnumStringRequired;
const EnumStringNotRequired = (enumValues) => {
    return {
        type: String,
        required: false,
        enum: enumValues,
        default: null,
    };
};
exports.EnumStringNotRequired = EnumStringNotRequired;
const EnumStringRole = (enumValues) => {
    return {
        type: String,
        required: false,
        enum: enumValues,
        default: "user",
    };
};
exports.EnumStringRole = EnumStringRole;
const EnumStringStatus = (enumValues) => {
    return {
        type: String,
        required: false,
        enum: enumValues,
        default: "offline",
    };
};
exports.EnumStringStatus = EnumStringStatus;
async function paginate(query, page = 1, fields, path) {
    let limit = 20;
    page = !page || page < 1 || isNaN(page) ? 1 : page;
    const skip = limit * (page - 1);
    const totalItems = await query.model.countDocuments(query.getFilter());
    const totalPages = Math.ceil(totalItems / limit);
    const data = await query.skip(skip).limit(limit).populate(path, fields).exec();
    return { totalItems, totalPages, currentPage: page, data };
}
const ImageSlider = {
    mediaUrl: { type: String, required: true },
    mediaId: { type: String, required: true },
    mediaType: EnumStringRequired(DeviceType_1.DeviceTypeArr),
};
exports.ImageSlider = ImageSlider;
