import { Telegraf, session, Context } from 'telegraf';
import { ConfigMod } from '../config';
import { getUserByTgId, saveUser } from '../../data/User';
import { formatDate, notifyUserAtSlotTime, sendAvailableTasks } from './botFunctions';
import { getAvailibleTask, getAwaitingResultTask, moveTaskToSendedToUser, registerUserToSlot, saveTask } from '../../data/Tasks';
import { saveTaskResponse } from '../../data/TaskResponse';

export async function runBot() {

    try {
      const botUrl = await ConfigMod.getBotUrl();
      const bot = new Telegraf(botUrl);
  
      bot.start(async (ctx) => {
        const telegramAddress = ctx.from.username || ctx.from.id.toString();
        const existingUser = await getUserByTgId(telegramAddress);
  
        if (existingUser) {
          await ctx.reply(`Вы уже зарегистрированы как ${existingUser.username}. Ваш Kaspi номер: ${existingUser.kaspiNumber}.`);
        } else {
          await ctx.reply('Здравствуйте, напишите свое полное имя.');
          // Создаем нового пользователя с начальным состоянием
          const newUser = {
            username: 'null',
            telegramAddress: telegramAddress,
            kaspiNumber: 404,
            chatId: ctx.from.id,
            session: 'awaitingFullName', // Устанавливаем состояние
          };
          await saveUser(newUser);
        }
      });

      bot.command("hello", ctx => ctx.reply("Hello, friend!"));

      
      bot.command('book_slot', async (ctx) => {
        console.log('book clicked');
        const telegramAddress = ctx.from.username || ctx.from.id.toString();
        console.log('Telegram адрес:', telegramAddress);
        const existingUser = await getUserByTgId(telegramAddress);
        console.log('Существующий пользователь:', existingUser); 
    
        if (existingUser && existingUser.session === 'completed') {
            const task = await getAvailibleTask();
            console.log("sended task",task);
            if (!task || task.slots.length === 0) {
                await ctx.reply('Нет доступных заданий.');
                return;
            }
            
            const buttons = task.slots.map((slot, index) => {
                return [{ text: `Слот ${index + 1}: ${formatDate(slot.time)}`, callback_data: `book_slot_${index}` }];
            });
           
    
            await ctx.reply('Пожалуйста, выберите слот для бронирования:', {
                reply_markup: {
                    inline_keyboard: buttons,
                },
            });
        } else {
            await ctx.reply('Сначала завершите регистрацию.');
        }
    });
  
      bot.on('text', async (ctx) => {
        const telegramAddress = ctx.from.username || ctx.from.id.toString();
        const existingUser = await getUserByTgId(telegramAddress);
        const awaitingTaskResult =  await getAwaitingResultTask(telegramAddress);
        if (existingUser) {
          if (existingUser.session === 'awaitingKaspiNumber') {
            const kaspiNumber = Number(ctx.message.text);
            if (isNaN(kaspiNumber)) {
              await ctx.reply('Пожалуйста, введите корректный Kaspi номер.');
              return;
            }
            existingUser.kaspiNumber = kaspiNumber;
            existingUser.session = 'completed'; // Обновляем состояние
            await existingUser.save();
            await ctx.reply(`Спасибо, ${existingUser.username}. Вы успешно зарегистрированы с Kaspi номером: ${kaspiNumber}. Ожидайте новых заданий!!!`);
          } else if (existingUser.session === 'awaitingFullName') {
            // Сохраняем полное имя
            existingUser.username = ctx.message.text;
            existingUser.session = 'awaitingKaspiNumber'; // Переход к следующему состоянию
            await existingUser.save();
            await ctx.reply(`Спасибо, ${ctx.message.text}. Теперь напишите свой Kaspi номер.`);
          }
          if(awaitingTaskResult.length > 0){
            const taskId = awaitingTaskResult[0]._id;
            const userResponse = ctx.message.text;
            await saveTaskResponse(taskId.toString(),telegramAddress,userResponse); 
            await ctx.reply(`Спасибо! Ваш ответ записан: "${userResponse}"`);
            existingUser.session = 'completed'; // Сброс состояния
            await existingUser.save();
            return;
          }
        } else {
          await ctx.reply('Вы не зарегистрированы. Пожалуйста, используйте команду /start для начала регистрации.');
        }
      });

      bot.on('photo', async (ctx) => {
        const telegramAddress = ctx.from.username || ctx.from.id.toString();
        const existingUser = await getUserByTgId(telegramAddress);
        const awaitingTaskResult = await getAwaitingResultTask(telegramAddress);
        
        if (existingUser) {
            if (awaitingTaskResult.length > 0) {
                const taskId = awaitingTaskResult[0]._id;
                const userResponse = "User provided a photo."; // Or handle as needed
    
                const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
                const fileUrl = await ctx.telegram.getFileLink(fileId); // Get the direct link to the file
    
                await saveTaskResponse(taskId.toString(), telegramAddress, userResponse, fileUrl.toString());
                await ctx.reply(`Спасибо! Ваш ответ записан с фото.`);
                existingUser.session = 'completed'; // Reset session state
                await existingUser.save();
                return;
            }
        } else {
            await ctx.reply('Вы не зарегистрированы. Пожалуйста, используйте команду /start для начала регистрации.');
        }
    });
     
    bot.action(/book_slot_(\d+)/, async (ctx) => {
        const slotIndex = parseInt(ctx.match[1], 10);
        const telegramAddress = ctx.from.username || ctx.from.id.toString();
        const existingUser = await getUserByTgId(telegramAddress);
    
        if (existingUser && existingUser.session === 'completed') {
            const task = await getAvailibleTask(); // Получаем задания заново
            if (!task || !task.slots[slotIndex]) {
                await ctx.reply('Этот слот недоступен. Пожалуйста, выберите другой слот.');
                return;
            }
    
            const slot = task.slots[slotIndex];
            if (slot.isBooked) {
                await ctx.reply('Этот слот уже занят. Пожалуйста, выберите другой слот.');
                return;
            }
    
            // Регистрируем пользователя на слот
            
            await registerUserToSlot(task._id.toString(), telegramAddress, slot.time);
            await ctx.reply(`Вы успешно зарегистрировались на слот: ${formatDate(slot.time)}`);
            existingUser.session = 'completed'; 
            await existingUser.save();
            notifyUserAtSlotTime(bot, slot,telegramAddress);
        } else {
            await ctx.reply('Сначала завершите регистрацию.');
        }
    });
      setInterval(() => sendAvailableTasks(bot), 60000);
      bot.launch();
    } catch (e) {
      console.error('Failed to launch bot:', e);
    }
  }

