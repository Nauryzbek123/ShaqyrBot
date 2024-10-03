import { ConfigMod } from "../config";
import Redis from 'ioredis';
import Queue, { QueueOptions } from 'bull'; 


export type QueueJobData = {
    id: string;
    message: string;
  };
  
  const redisUrl = ConfigMod.getRedis();
  
  export const queueOptions: QueueOptions = {
    redis: redisUrl,
  };
  export const queue = new Queue<QueueJobData>('QUEUE1', queueOptions); 