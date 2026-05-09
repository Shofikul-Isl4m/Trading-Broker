import { WebSocketServer } from "ws";
import { subscriber } from "@repo/redis/pubsub"

const wss = new WebSocketServer({ port: 8080 });


(async () => {


    subscriber.subscribe("ws:update:price", (msg) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN)
                client.send(msg)
        })



    })




})



