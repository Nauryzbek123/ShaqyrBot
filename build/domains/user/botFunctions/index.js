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
exports.notifyUserAtSlotTime = exports.sendAvailableTasks = exports.formatDate = void 0;
const Tasks_1 = require("../../../data/Tasks");
const User_1 = require("../../../data/User");
const node_schedule_1 = __importDefault(require("node-schedule"));
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
            console.log(availableTask);
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
                        let messageText = `Доступное задание: ${availableTask.description}\n`;
                        let slotText = `Временные слоты:\n${slotsInfo}\n` +
                            `Чтобы забронировать слот, отправьте команду: /book_slot.`;
                        // await bot.telegram.sendMessage(chatId, `Доступное задание: ${availableTask.description}\nВременные слоты:\n${slotsInfo}\nЧтобы забронировать слот, отправьте команду: /book_slot.`);
                        const task = {
                            title: availableTask.title,
                            description: availableTask.description,
                            isAvailible: availableTask.isAvailible
                        };
                        if (availableTask.photos[0]) {
                            const photoUrl = `https://37ea-147-30-47-45.ngrok-free.app/${availableTask.photos[0]}`;
                            yield bot.telegram.sendPhoto(chatId, photoUrl, { caption: messageText });
                            yield bot.telegram.sendMessage(chatId, slotText);
                        }
                        else {
                            yield bot.telegram.sendMessage(chatId, slotText);
                        }
                        if (availableTask.videos[0] !== '') {
                            const videoUrl = `https://37ea-147-30-47-45.ngrok-free.app/${availableTask.videos[0]}`;
                            yield bot.telegram.sendVideo(chatId, videoUrl, { caption: 'Вот инструкция.' });
                        }
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
const notifyUserAtSlotTime = (bot, slot, telegramAddress) => {
    const slotTime = new Date(slot.time);
    // Запланировать отправку уведомления в начале слота
    node_schedule_1.default.scheduleJob(slotTime, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield bot.telegram.sendMessage(telegramAddress, 'Пожалуйста, отправьте ваше задание (текст и/или фото) для текущего временного слота.');
        }
        catch (error) {
            console.error(`Failed to notify user ${telegramAddress} at slot time:`, error);
        }
    }));
};
exports.notifyUserAtSlotTime = notifyUserAtSlotTime;
