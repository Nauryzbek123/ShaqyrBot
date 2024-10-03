import mongoose from "mongoose";
import { ConfigMod } from "../domains/config"

export const initDatabase = async () => {
    const dbUrl = await ConfigMod.getDbUrl(); 
    console.log(dbUrl);
    await mongoose.connect(dbUrl,{
    }); 
    console.log('MongoDB connected');
}; 

module.exports = {initDatabase}