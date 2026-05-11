import { WebSocket, WebSocketServer } from "ws";
import { subscriber } from "@repo/redis/pubsub"

const wss = new WebSocketServer({ port: 8080 });


(async () => {
    try {
        await subscriber.connect()
    } catch (error) {
        console.error(error)
    }

    await subscriber.subscribe("ws:update:price", (msg) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(msg)
                } catch (error) {
                    console.error(error)
                }
            }

        })



    })

})()

setInterval(() => {
    wss.clients.forEach((client) => {
        const ws = client as WebSocket & { isAlive?: boolean };
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping();
    })
}, 30000)


wss.on("connection", (ws) => {
    const customWs = ws as WebSocket & { isAlive?: boolean }
    customWs.isAlive = true;

    ws.on("pong", () => {
        customWs.isAlive = true;
        ws.ping();
    })
})



