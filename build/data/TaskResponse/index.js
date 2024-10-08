"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveTaskResponse = void 0;
const taskResponse_1 = __importDefault(require("../../db/taskResponse"));
function saveTaskResponse(taskId, telegramAddress, userResponse, photoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = new taskResponse_1.default({
                taskId: taskId,
                userId: telegramAddress,
                responseText: userResponse,
                photo: (photoUrl === null || photoUrl === void 0 ? void 0 : photoUrl.toString()) || '', // Include the photo URL if provided
            });
            yield response.save();
            console.log(`Response saved for user ${telegramAddress} on task ${taskId}`);
        }
        catch (error) {
            console.error('Error saving user response:', error);
        }
    });
}
exports.saveTaskResponse = saveTaskResponse;
