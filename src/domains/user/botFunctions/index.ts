
import { Context, Telegraf } from 'telegraf';
import { getAvailibleTask, getTaskNotSendedToUser, moveTaskToSendedToUser } from '../../../data/Tasks';
import { getAllRegisteredUsers } from '../../../data/User';
import schedule from 'node-schedule'; 


export const formatDate = (date: Date,timeZone: string = 'Asia/Almaty'): string => {
  const options: Intl.DateTimeFormatOptions = { 
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

export async function sendAvailableTasks(bot: Telegraf) {
    try {
      const availableTask = await getTaskNotSendedToUser();
      console.log(availableTask);
      if (!availableTask) {
        console.log('No available tasks at the moment.');
        return;
      }
    availableTask.expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа с момента отправки
    await availableTask.save();
      const registeredUsers = await getAllRegisteredUsers();
      if (!registeredUsers) {
        console.log('No registered users found.');
        return;
      }

      const slotsInfo = availableTask.slots
      .map((slot, index) => `Слот ${index + 1}: ${formatDate(slot.time)} - ${slot.isBooked ? 'Занят' : 'Свободен'}`)
      .join('\n');
  
      for (const user of registeredUsers) {
        const chatId = user.chatId; // Should be the Telegram User ID
        if (chatId) {
          console.log(`Sending message to ${chatId}: Доступное задание: ${availableTask.description}`);
  
          try {
            let messageText = `Доступное задание: ${availableTask.description}\n`;
            let slotText =  `Временные слоты:\n${slotsInfo}\n` +
                            `Чтобы забронировать слот, отправьте команду: /book_slot.`;

            // await bot.telegram.sendMessage(chatId, `Доступное задание: ${availableTask.description}\nВременные слоты:\n${slotsInfo}\nЧтобы забронировать слот, отправьте команду: /book_slot.`);
            const task = {
                title: availableTask.title, 
                description: availableTask.description, 
                isAvailible: availableTask.isAvailible
            }
            if (availableTask.photos[0]) {
              const photoUrl = `https://37ea-147-30-47-45.ngrok-free.app/${availableTask.photos[0]}`; 
              await bot.telegram.sendPhoto(chatId, photoUrl, { caption: messageText }); 
              await bot.telegram.sendMessage(chatId, slotText);
            } else {
              await bot.telegram.sendMessage(chatId, slotText);
            }
            if(availableTask.videos[0] !== ''){
              const videoUrl = `https://37ea-147-30-47-45.ngrok-free.app/${availableTask.videos[0]}`;
              await bot.telegram.sendVideo(chatId,videoUrl,{ caption: 'Вот инструкция.' })
            }
            await moveTaskToSendedToUser(task);
          } catch (error) {
            console.error(`Failed to send message to ${chatId}:`, error);
          }
        } else {
          console.warn(`User with no valid telegramAddress found: ${user.username}`);
        }
      }
    } catch (error) {
      console.error('Error sending available tasks:', error);
    }
  }


  export const notifyUserAtSlotTime = (bot: Telegraf<Context>, slot: { time: Date }, telegramAddress: number | string) => {
    const slotTime = new Date(slot.time);
  
    // Запланировать отправку уведомления в начале слота
    schedule.scheduleJob(slotTime, async () => {
      try {
        await bot.telegram.sendMessage(telegramAddress, 'Пожалуйста, отправьте ваше задание (текст и/или фото) для текущего временного слота.');
      } catch (error) {
        console.error(`Failed to notify user ${telegramAddress} at slot time:`, error);
      }
    });
  };