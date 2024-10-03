"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const tasksSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    isAvailible: {
        type: Boolean,
        required: true,
    },
    sendedToUser: {
        type: Boolean,
        required: true
    },
    slots: [
        {
            time: { type: Date, required: true },
            isBooked: { type: Boolean, default: false },
            bookedBy: { type: String, default: null }, // Username пользователя, который зарегистрировался
        },
    ],
    expirationDate: {
        type: Date,
        required: true,
    }
}, {
    timestamps: true,
});
const tasks = mongoose_1.default.model('Tasks', tasksSchema);
exports.default = tasks;
