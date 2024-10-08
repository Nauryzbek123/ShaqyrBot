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
    default: true 
  }, 
  sendedToUser: {
    type: Boolean, 
    required: true,
    default: false
  },
  slots: [
    {
      time: { type: Date, required: true }, // Временной слот (начало)
      isBooked: { type: Boolean, default: false }, // Занят или свободен
      bookedBy: { type: String, default: null }, // Username пользователя, который зарегистрировался
      status: {type: String, default: ''},
    },
  ],
  results: { 
    type: [{
      userId: { type: String, required: true }, // ID of the user
      text: { type: String, default: 'pending' }, // Text response
      photo: { type: String, default: '' }, // Photo URL if applicable
    }],
    default: [],
  },
  expirationDate: { 
    type: Date,
    required: true,
  }, 
  photos: [{ 
    type: String,
    default: '',
  }],
  videos: [{ 
    type: String,
    default: '',
  }],
}, {
  timestamps: true,
});

const tasks = mongoose.model('Tasks', tasksSchema);

export default tasks;