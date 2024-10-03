import mongoose from 'mongoose';

const tasksSchema = new mongoose.Schema({
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
      time: { type: Date, required: true }, // Временной слот (начало)
      isBooked: { type: Boolean, default: false }, // Занят или свободен
      bookedBy: { type: String, default: null }, // Username пользователя, который зарегистрировался
      result: { 
        text: { type: String, default: '' }, // Текстовый результат
        photo: { type: String, default: '' }, // Ссылка на загруженное фото (например, URL файла)
      },
    },
  ],
  expirationDate: { // Дата истечения срока задания (24 часа после отправки)
    type: Date,
    required: true,
  }
}, {
  timestamps: true,
});

const tasks = mongoose.model('Tasks', tasksSchema);

export default tasks;