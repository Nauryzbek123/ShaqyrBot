"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queue = exports.queueOptions = void 0;
const config_1 = require("../config");
const bull_1 = __importDefault(require("bull"));
const redisUrl = config_1.ConfigMod.getRedis();
exports.queueOptions = {
    redis: redisUrl,
};
exports.queue = new bull_1.default('QUEUE1', exports.queueOptions);
