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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigMod = void 0;
class ConfigMod {
    static getDbUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            return ConfigMod.dbUrl;
        });
    }
    static getBotUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            return ConfigMod.botApi;
        });
    }
    static getRedis() {
        return ConfigMod.redis;
    }
}
exports.ConfigMod = ConfigMod;
ConfigMod.dbUrl = "mongodb+srv://nauryzbekdias2:Barcelona2603@disa.giygccp.mongodb.net/";
ConfigMod.botApi = "7426663682:AAGpjM1ByzQkIE8I4E8laGaLuKo6GMGLcrg";
ConfigMod.redis = "redis://127.0.0.1:6379";
