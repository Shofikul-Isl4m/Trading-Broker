import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "trading-broker",
    brokers: ["localhost:9092"]

})


export async function createTopic(topic: string, partitions: number = 2) {
    const admin = kafka.admin();
    console.log("admin connectiong...");
    await admin.connect();
    console.log("admin connected successfully");
    await admin.createTopics({
        topics: [
            {
                topic: topic,
                numPartitions: partitions
            }
        ]
    })

    console.log(`topic ${topic} created success`)
    console.log("admin disconnecting...")

    await admin.disconnect();

}


export function consumer() {
    const producer = kafka.producer();
    console.log("producer connecting");
    producer.connect();
    console.log("producer connected successfully")

}

export default kafka;