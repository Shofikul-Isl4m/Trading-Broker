import kafka from "@repo/kafka/index.ts";
import { publisher } from "@repo/redis/pubsub";


let lastInsertTime = Date.now();
const assertPrices: { [key: string]: object } = {

}
const dataToBeSent: {
    [key: string]: object
} = {}

function savePriceFromStr(value: string = "22.844564") {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    const str = n.toFixed(4);
    const [part, frac] = str.split(".");
    const int = part ?? "0";
    const fraction = frac ?? "0000";
    const combined = int + frac;
    const result = Number.parseInt(combined, 10);
    if (!Number.isNaN(combined)) return result;
}
savePriceFromStr()
try {
    let consumer = kafka.consumer({ groupId: 'my-group' });
    await publisher.connect()
    await consumer.connect()
    await consumer.subscribe({ topics: ["price-update"] });
    const producer = kafka.producer();
    await consumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            console.log({
                key: message.key?.toString(),
                value: message.value?.toString(),

            })
            if (!message.value || !message.key) return;
            let value = JSON.parse(message.value?.toString());
            let symbol = message.key?.toString();
            const a = savePriceFromStr(value?.a);
            const b = savePriceFromStr(value.b);
            const s = String(value.s);

            assertPrices[s] = {
                a, b, decimal: 0
            };

            let timeDiff = Date.now() - lastInsertTime;
            if (timeDiff > 100)
                for (const [key, value] of Object.entries(assertPrices)) {
                    dataToBeSent[key] = value;
                }
            console.log("assert", assertPrices)
            console.log("tosent", dataToBeSent)
            publisher.publish("ws:update:price", JSON.stringify(dataToBeSent))
            await producer.connect();
            await producer.send({
                topic: "stream-app-info",
                messages: [
                    {
                        key: "stream-app-info",
                        value: JSON.stringify({
                            reqId: "no-return",
                            tradeInfo: dataToBeSent
                        })
                    }
                ]
            })
            lastInsertTime = Date.now()
        },
    })

} catch (error) {
    console.error("kafka consumer error", error)
}


