import { type RedisClientType } from "redis";
import client from "./index.ts";

export const subscriber: RedisClientType = client.duplicate();
export const publisher: RedisClientType = client.duplicate();