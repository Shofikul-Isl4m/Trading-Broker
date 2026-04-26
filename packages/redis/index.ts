import { createClient, type RedisClientType } from "redis";


const client: RedisClientType = createClient({
    url: "redis://localhost:6379"
})

client.on("error", err => console.log("redis client error", err));


export default client;

