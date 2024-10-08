import mongoose from "mongoose";

const taskResponseSchema = new mongoose.Schema({
    taskId: { type: String, required: true },
    userId: { type: String, required: true },
    responseText: { type: String, default: 'pending' },
    photo: { type: String, default: '' }, // New field for the photo URL
});

const TaskResponse = mongoose.model('TaskResponse', taskResponseSchema);
export default TaskResponse;