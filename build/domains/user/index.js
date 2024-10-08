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
exports.runBot = void 0;
const telegraf_1 = require("telegraf");
const config_1 = require("../config");
const User_1 = require("../../data/User");
const botFunctions_1 = require("./botFunctions");
const Tasks_1 = require("../../data/Tasks");
const TaskResponse_1 = require("../../data/TaskResponse");
function runBot() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const botUrl = yield config_1.ConfigMod.getBotUrl();
            const bot = new telegraf_1.Telegraf(botUrl);
            bot.start((ctx) => __awaiter(this, void 0, void 0, function* () {
                const telegramAddress = ctx.from.username || ctx.from.id.toString();
                const existingUser = yield (0, User_1.getUserByTgId)(telegramAddress);
                if (existingUser) {
                    yield ctx.reply(`Вы уже зарегистрированы как ${existingUser.username}. Ваш Kaspi номер: ${existingUser.kaspiNumber}.`);
                }
                else {
                    yield ctx.reply('Здравствуйте, напишите свое полное имя.');
                    // Создаем нового пользователя с начальным состоянием
                    const newUser = {
                        username: 'null',
                        telegramAddress: telegramAddress,
                        kaspiNumber: 404,
                        chatId: ctx.from.id,
                        session: 'awaitingFullName', // Устанавливаем состояние
                    };
                    yield (0, User_1.saveUser)(newUser);
                }
            }));
            bot.command("hello", ctx => ctx.reply("Hello, friend!"));
            bot.command('book_slot', (ctx) => __awaiter(this, void 0, void 0, function* () {
                console.log('book clicked');
                const telegramAddress = ctx.from.username || ctx.from.id.toString();
                console.log('Telegram адрес:', telegramAddress);
                const existingUser = yield (0, User_1.getUserByTgId)(telegramAddress);
                console.log('Существующий пользователь:', existingUser);
                if (existingUser && existingUser.session === 'completed') {
                    const task = yield (0, Tasks_1.getAvailibleTask)();
                    console.log("sended task", task);
                    if (!task || task.slots.length === 0) {
                        yield ctx.reply('Нет доступных заданий.');
                        return;
                    }
                    const buttons = task.slots.map((slot, index) => {
                        return [{ text: `Слот ${index + 1}: ${(0, botFunctions_1.formatDate)(slot.time)}`, callback_data: `book_slot_${index}` }];
                    });
                    yield ctx.reply('Пожалуйста, выберите слот для бронирования:', {
                        reply_markup: {
                            inline_keyboard: buttons,
                        },
                    });
                }
                else {
                    yield ctx.reply('Сначала завершите регистрацию.');
                }
            }));
            bot.on('text', (ctx) => __awaiter(this, void 0, void 0, function* () {
                const telegramAddress = ctx.from.username || ctx.from.id.toString();
                const existingUser = yield (0, User_1.getUserByTgId)(telegramAddress);
                const awaitingTaskResult = yield (0, Tasks_1.getAwaitingResultTask)(telegramAddress);
                if (existingUser) {
                    if (existingUser.session === 'awaitingKaspiNumber') {
                        const kaspiNumber = Number(ctx.message.text);
                        if (isNaN(kaspiNumber)) {
                            yield ctx.reply('Пожалуйста, введите корректный Kaspi номер.');
                            return;
                        }
                        existingUser.kaspiNumber = kaspiNumber;
                        existingUser.session = 'completed'; // Обновляем состояние
                        yield existingUser.save();
                        yield ctx.reply(`Спасибо, ${existingUser.username}. Вы успешно зарегистрированы с Kaspi номером: ${kaspiNumber}. Ожидайте новых заданий!!!`);
                    }
                    else if (existingUser.session === 'awaitingFullName') {
                        // Сохраняем полное имя
                        existingUser.username = ctx.message.text;
                        existingUser.session = 'awaitingKaspiNumber'; // Переход к следующему состоянию
                        yield existingUser.save();
                        yield ctx.reply(`Спасибо, ${ctx.message.text}. Теперь напишите свой Kaspi номер.`);
                    }
                    if (awaitingTaskResult.length > 0) {
                        const taskId = awaitingTaskResult[0]._id;
                        const userResponse = ctx.message.text;
                        yield (0, TaskResponse_1.saveTaskResponse)(taskId.toString(), telegramAddress, userResponse);
                        yield ctx.reply(`Спасибо! Ваш ответ записан: "${userResponse}"`);
                        existingUser.session = 'completed'; // Сброс состояния
                        yield existingUser.save();
                        return;
                    }
                }
                else {
                    yield ctx.reply('Вы не зарегистрированы. Пожалуйста, используйте команду /start для начала регистрации.');
                }
            }));
            bot.on('photo', (ctx) => __awaiter(this, void 0, void 0, function* () {
                const telegramAddress = ctx.from.username || ctx.from.id.toString();
                const existingUser = yield (0, User_1.getUserByTgId)(telegramAddress);
                const awaitingTaskResult = yield (0, Tasks_1.getAwaitingResultTask)(telegramAddress);
                if (existingUser) {
                    if (awaitingTaskResult.length > 0) {
                        const taskId = awaitingTaskResult[0]._id;
                        const userResponse = "User provided a photo."; // Or handle as needed
                        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
                        const fileUrl = yield ctx.telegram.getFileLink(fileId); // Get the direct link to the file
                        yield (0, TaskResponse_1.saveTaskResponse)(taskId.toString(), telegramAddress, userResponse, fileUrl.toString());
                        yield ctx.reply(`Спасибо! Ваш ответ записан с фото.`);
                        existingUser.session = 'completed'; // Reset session state
                        yield existingUser.save();
                        return;
                    }
                }
                else {
                    yield ctx.reply('Вы не зарегистрированы. Пожалуйста, используйте команду /start для начала регистрации.');
                }
            }));
            bot.action(/book_slot_(\d+)/, (ctx) => __awaiter(this, void 0, void 0, function* () {
                const slotIndex = parseInt(ctx.match[1], 10);
                const telegramAddress = ctx.from.username || ctx.from.id.toString();
                const existingUser = yield (0, User_1.getUserByTgId)(telegramAddress);
                if (existingUser && existingUser.session === 'completed') {
                    const task = yield (0, Tasks_1.getAvailibleTask)(); // Получаем задания заново
                    if (!task || !task.slots[slotIndex]) {
                        yield ctx.reply('Этот слот недоступен. Пожалуйста, выберите другой слот.');
                        return;
                    }
                    const slot = task.slots[slotIndex];
                    if (slot.isBooked) {
                        yield ctx.reply('Этот слот уже занят. Пожалуйста, выберите другой слот.');
                        return;
                    }
                    // Регистрируем пользователя на слот
                    yield (0, Tasks_1.registerUserToSlot)(task._id.toString(), telegramAddress, slot.time);
                    yield ctx.reply(`Вы успешно зарегистрировались на слот: ${(0, botFunctions_1.formatDate)(slot.time)}`);
                    existingUser.session = 'completed';
                    yield existingUser.save();
                    (0, botFunctions_1.notifyUserAtSlotTime)(bot, slot, telegramAddress);
                }
                else {
                    yield ctx.reply('Сначала завершите регистрацию.');
                }
            }));
            setInterval(() => (0, botFunctions_1.sendAvailableTasks)(bot), 60000);
            bot.launch();
        }
        catch (e) {
            console.error('Failed to launch bot:', e);
        }
    });
}
exports.runBot = runBot;
