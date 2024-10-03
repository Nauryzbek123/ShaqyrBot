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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAvailableTasks = exports.formatDate = void 0;
const Tasks_1 = require("../../../data/Tasks");
const User_1 = require("../../../data/User");
const formatDate = (date, timeZone = 'Asia/Almaty') => {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timeZone
    };
    return date.toLocaleString('ru-RU', options);
};
exports.formatDate = formatDate;
function sendAvailableTasks(bot) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const availableTask = yield (0, Tasks_1.getTaskNotSendedToUser)();
            if (!availableTask) {
                console.log('No available tasks at the moment.');
                return;
            }
            availableTask.expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа с момента отправки
            yield availableTask.save();
            const registeredUsers = yield (0, User_1.getAllRegisteredUsers)();
            if (!registeredUsers) {
                console.log('No registered users found.');
                return;
            }
            const slotsInfo = availableTask.slots
                .map((slot, index) => `Слот ${index + 1}: ${(0, exports.formatDate)(slot.time)} - ${slot.isBooked ? 'Занят' : 'Свободен'}`)
                .join('\n');
            for (const user of registeredUsers) {
                const chatId = user.chatId; // Should be the Telegram User ID
                if (chatId) {
                    console.log(`Sending message to ${chatId}: Доступное задание: ${availableTask.description}`);
                    try {
                        yield bot.telegram.sendMessage(chatId, `Доступное задание: ${availableTask.description}\nВременные слоты:\n${slotsInfo}\nЧтобы забронировать слот, отправьте команду: /book_slot.`);
                        const task = {
                            title: availableTask.title,
                            description: availableTask.description,
                            isAvailible: availableTask.isAvailible
                        };
                        yield (0, Tasks_1.moveTaskToSendedToUser)(task);
                    }
                    catch (error) {
                        console.error(`Failed to send message to ${chatId}:`, error);
                    }
                }
                else {
                    console.warn(`User with no valid telegramAddress found: ${user.username}`);
                }
            }
        }
        catch (error) {
            console.error('Error sending available tasks:', error);
        }
    });
}
exports.sendAvailableTasks = sendAvailableTasks;
