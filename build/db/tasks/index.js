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
        default: true
    },
    sendedToUser: {
        type: Boolean,
        required: true,
        default: false
    },
    slots: [
        {
            time: { type: Date, required: true },
            isBooked: { type: Boolean, default: false },
            bookedBy: { type: String, default: null },
            status: { type: String, default: '' },
        },
    ],
    results: {
        type: [{
                userId: { type: String, required: true },
                text: { type: String, default: 'pending' },
                photo: { type: String, default: '' }, // Photo URL if applicable
            }],
        default: [],
    },
    expirationDate: {
        type: Date,
        required: true,
    },
    photos: [{
            type: String,
            default: '',
        }],
    videos: [{
            type: String,
            default: '',
        }],
}, {
    timestamps: true,
});
const tasks = mongoose_1.default.model('Tasks', tasksSchema);
exports.default = tasks;
