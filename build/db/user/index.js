"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const usersSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    telegramAddress: {
        type: String,
        required: true
    },
    kaspiNumber: {
        type: Number,
        required: true,
    },
    chatId: {
        type: Number,
        required: true
    },
    session: {
        type: String,
        enum: ['awaitingFullName', 'awaitingKaspiNumber', 'completed'],
        default: null // По умолчанию null, если пользователь еще не начал регистрацию
    }
}, {
    timestamps: true,
});
const users = mongoose_1.default.model('Users', usersSchema);
exports.default = users;
