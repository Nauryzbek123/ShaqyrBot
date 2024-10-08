import tasks from "../../db/tasks";

export async function getAvailibleTask() {
    try{
      const task = await tasks.findOne({isAvailible: true}).exec();
      if(!task){
        console.log("No tasks availible");
      }
      return task;
    }catch(e){
        console.log(e);
    }
}
export async function getTaskNotSendedToUser() {
  try{
    const task = await tasks.findOne({sendedToUser: false}).exec();
    if(!task){
      console.log("No tasks availible");
    }
    return task;
  }catch(e){
      console.log(e);
  }
}
function generateTimeSlots(startTime: Date, durationMinutes: number, intervalMinutes: number) {
  const slots = [];
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000); // Время окончания через 24 часа
  
  // Генерация слотов с шагом `intervalMinutes`
  for (let time = startTime; time < endTime; time = new Date(time.getTime() + intervalMinutes * 60000)) {
    slots.push({ 
      time: new Date(time), // Время слота
      isBooked: false,      // Слот свободен
      bookedBy: null        // Никем не занят
    });
  }

  return slots;
}


// export async function saveTask(task: { title: string; description: string; isAvailible: boolean }) {
//     const newTask = new tasks(task);
//     await newTask.save();
//   }

  export async function moveTaskToSendedToUser(task: { title: string; description: string; isAvailible: boolean }) {
    try {
      const updatedTask = await tasks.findOneAndUpdate(
        { title: task.title, description: task.description, isAvailible: true,sendedToUser: false }, // Find the task by title and description
        { sendedToUser: true }, 
        { new: true }
      );
  
      if (!updatedTask) {
        console.log('Task not found or already updated.');
        return;
      }
  
      console.log(`Task moved to sent status: ${updatedTask.title}`);
    } catch (error) {
      console.error('Error moving task to sent status:', error);
    }
  }

  export async function saveTask(task: { title: string; description: string; isAvailible: boolean }) {
    const startTime = new Date(); // Начальное время слотов - текущее время
    const slots = generateTimeSlots(startTime, 24 * 60, 30); // Генерация слотов: 24 часа, по 30 минут каждый
  
    const newTask = new tasks({
      ...task,
      slots: slots,
      expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Задание действительно 24 часа
    });
  
    await newTask.save();
  }

  export async function registerUserToSlot(taskId: string, username: string, slotTime: Date) {
    try {
      const task = await tasks.findById(taskId);
  
      if (!task) {
        throw new Error('Task not found');
      }
  
      const slot = task.slots.find((slot) => slot.time.getTime() === new Date(slotTime).getTime());
  
      if (!slot) {
        throw new Error('Slot not found');
      }
  
      if (slot.isBooked) {
        throw new Error('Slot already booked');
      }
  
      slot.isBooked = true;
      slot.bookedBy = username;
      slot.status = 'awaitingResult';
      await task.save();
      console.log(`User ${username} successfully registered to slot at ${slotTime}`);
    } catch (error) {
      console.error('Error registering user to slot:', error);
    }
  }


  export async function saveUserResponse(taskId: string, userId: string, textResponse?: string, photoUrl?: string) {
    try {
      const task = await tasks.findById(taskId);
      
      if (!task) {
        throw new Error('Task not found');
      }
  
      // Prepare the response object
      const response = {
        userId: userId,
        text: textResponse || 'pending', // If no text response, default to 'pending'
        photo: photoUrl || '',
      };
  
      // Push the response into the results array
      task.results.push(response);
      await task.save();
      
      console.log(`Response saved for user ${userId} on task ${taskId}`);
    } catch (error) {
      console.error('Error saving user response:', error);
    }
  }
 
 export async function getAwaitingResultTask(userId: string) {
    try {
      const tasksWithAwaitingResults = await tasks.find({
        "slots": {
          $elemMatch: {
            bookedBy: userId,         
            status: 'awaitingResult'  
          }
        }
      }).exec();
  
      if (!tasksWithAwaitingResults || tasksWithAwaitingResults.length === 0) {
        console.log("No tasks awaiting results for user:", userId);
      }
  
      return tasksWithAwaitingResults;
    } catch (e) {
      console.log("Error fetching tasks with awaiting results:", e);
      throw e;
    }
  }