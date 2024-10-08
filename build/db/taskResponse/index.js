"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const taskResponseSchema = new mongoose_1.default.Schema({
    taskId: { type: String, required: true },
    userId: { type: String, required: true },
    responseText: { type: String, default: 'pending' },
    photo: { type: String, default: '' }, // New field for the photo URL
});
const TaskResponse = mongoose_1.default.model('TaskResponse', taskResponseSchema);
exports.default = TaskResponse;
