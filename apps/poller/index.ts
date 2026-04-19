
import { WebSocket } from "ws";

import kafka, { createTopic } from "@repo/kafka/index.ts";
const producer = kafka.producer();

async function start() {
    try {
        await createTopic("price-update", 2);
        producer.connect();
        console.log("kafka ready");
        const ws = new WebSocket("wss://ws.backpack.exchange");
        ws.on('open', () => {
            console.log("poller connected to the websocket");
            const playload = JSON.stringify({
                method: "SUBSCRIBE",
                params: [
                    "bookTicker.BTC_USDC_PERP",
                    "bookTicker.ETH_USDC_PERP",
                    "bookTicker.SOL_USDC_PERP",
                ],
                id: 1


            })
            ws.send(playload);
            console.log("poller subscriber to the exchange", playload);
        }
        );
        ws.on("message", async (msg: Buffer) => {
            const message = JSON.parse(msg.toString());
            const data = message.data;
            console.log(data, "/n")
            await producer.send({

                topic: "price-update",
                messages: [
                    {
                        partition: 0, key: data.s, value: JSON.stringify(data)
                    }
                ]

            })
            console.log(`sent tick for ${data.s}`)
        })



    } catch (error) {
        console.error("critical error", error)

    }


}




start()
