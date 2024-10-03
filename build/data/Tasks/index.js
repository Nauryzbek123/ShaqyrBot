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
exports.registerUserToSlot = exports.saveTask = exports.moveTaskToSendedToUser = exports.getTaskNotSendedToUser = exports.getAvailibleTask = void 0;
const tasks_1 = __importDefault(require("../../db/tasks"));
function getAvailibleTask() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const task = yield tasks_1.default.findOne({ isAvailible: true }).exec();
            if (!task) {
                console.log("No tasks availible");
            }
            return task;
        }
        catch (e) {
            console.log(e);
        }
    });
}
exports.getAvailibleTask = getAvailibleTask;
function getTaskNotSendedToUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const task = yield tasks_1.default.findOne({ sendedToUser: false }).exec();
            if (!task) {
                console.log("No tasks availible");
            }
            return task;
        }
        catch (e) {
            console.log(e);
        }
    });
}
exports.getTaskNotSendedToUser = getTaskNotSendedToUser;
function generateTimeSlots(startTime, durationMinutes, intervalMinutes) {
    const slots = [];
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000); // Время окончания через 24 часа
    // Генерация слотов с шагом `intervalMinutes`
    for (let time = startTime; time < endTime; time = new Date(time.getTime() + intervalMinutes * 60000)) {
        slots.push({
            time: new Date(time),
            isBooked: false,
            bookedBy: null // Никем не занят
        });
    }
    return slots;
}
// export async function saveTask(task: { title: string; description: string; isAvailible: boolean }) {
//     const newTask = new tasks(task);
//     await newTask.save();
//   }
function moveTaskToSendedToUser(task) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedTask = yield tasks_1.default.findOneAndUpdate({ title: task.title, description: task.description, isAvailible: true, sendedToUser: false }, // Find the task by title and description
            { sendedToUser: true }, { new: true });
            if (!updatedTask) {
                console.log('Task not found or already updated.');
                return;
            }
            console.log(`Task moved to sent status: ${updatedTask.title}`);
        }
        catch (error) {
            console.error('Error moving task to sent status:', error);
        }
    });
}
exports.moveTaskToSendedToUser = moveTaskToSendedToUser;
function saveTask(task) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = new Date(); // Начальное время слотов - текущее время
        const slots = generateTimeSlots(startTime, 24 * 60, 30); // Генерация слотов: 24 часа, по 30 минут каждый
        const newTask = new tasks_1.default(Object.assign(Object.assign({}, task), { slots: slots, expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Задание действительно 24 часа
         }));
        yield newTask.save();
    });
}
exports.saveTask = saveTask;
function registerUserToSlot(taskId, username, slotTime) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const task = yield tasks_1.default.findById(taskId);
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
            yield task.save();
            console.log(`User ${username} successfully registered to slot at ${slotTime}`);
        }
        catch (error) {
            console.error('Error registering user to slot:', error);
        }
    });
}
exports.registerUserToSlot = registerUserToSlot;
