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
exports.getAllRegisteredUsers = exports.getUserByTgId = exports.saveUser = void 0;
const user_1 = __importDefault(require("../../db/user"));
function saveUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const newUser = new user_1.default(user);
        yield newUser.save();
    });
}
exports.saveUser = saveUser;
function getUserByTgId(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield user_1.default.findOne({ telegramAddress: username }).exec();
            console.log(`user in func getUserbytg ${user}`);
            if (user) {
                return user;
            }
            else {
                console.log(`User with telegramAddress ${username} not found.`);
                return null;
            }
        }
        catch (error) {
            console.error(`Error fetching user by telegramAddress: ${error}`);
            throw error;
        }
    });
}
exports.getUserByTgId = getUserByTgId;
function getAllRegisteredUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield user_1.default.find();
            if (user) {
                return user;
            }
            else {
                console.log(`User with telegramAddress  not found.`);
                return null;
            }
        }
        catch (error) {
            console.error(`Error fetching user by telegramAddress: ${error}`);
            throw error;
        }
    });
}
exports.getAllRegisteredUsers = getAllRegisteredUsers;
