export class ConfigMod{
    private static dbUrl = "mongodb+srv://nauryzbekdias2:Barcelona2603@disa.giygccp.mongodb.net/";
    private static botApi = "7426663682:AAGpjM1ByzQkIE8I4E8laGaLuKo6GMGLcrg";
    private static redis = "redis://127.0.0.1:6379";
    
    public static async getDbUrl(){
        return ConfigMod.dbUrl;
    }
    public static async getBotUrl(){
        return ConfigMod.botApi;
    }
    public static  getRedis():string{
        return ConfigMod.redis;
    }
}

