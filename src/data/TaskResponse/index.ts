import { ObjectId } from "mongoose";
import TaskResponse from "../../db/taskResponse";

export async function saveTaskResponse(taskId: string, telegramAddress: string, userResponse: string, photoUrl?: string) {
    try {
        const response = new TaskResponse({
            taskId: taskId,
            userId: telegramAddress,
            responseText: userResponse,
            photo: photoUrl?.toString() || '', // Include the photo URL if provided
        });
  
        await response.save();
        console.log(`Response saved for user ${telegramAddress} on task ${taskId}`);
    } catch (error) {
        console.error('Error saving user response:', error);
    }
}
