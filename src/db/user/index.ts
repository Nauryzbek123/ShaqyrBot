import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  telegramAddress: {
    type: String,
    required: true
  },
  kaspiNumber: {
    type: Number,
    required: true,
  },
  chatId: {
    type: Number,
    required: true
  },
  session: {
    type: String, // Состояние регистрации
    enum: ['awaitingFullName', 'awaitingKaspiNumber', 'completed'], // Возможные состояния
    default: null // По умолчанию null, если пользователь еще не начал регистрацию
  }
}, {
  timestamps: true,
});

const users = mongoose.model('Users', usersSchema);

export default users;