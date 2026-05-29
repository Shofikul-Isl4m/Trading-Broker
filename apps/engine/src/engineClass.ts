

import { GetAssetBalMsg, GetUserBalMsg, Message, OpenTradesFetchMsg, PriceUpdateMsg, TradeCloseMsg, TradeOpenMsg, UserAuthMsg } from "@repo/types/zodSchema"
import { EngineResponseType, OpenOrders, UserBalance } from "@repo/types/types"
export class Engine {
    constructor(
        private readonly enginePuller: TypeOfRedisClient,
        private readonly enginePusher: TypeOfRedisClient,
        private readonly prisma: TypeOfPrismaClient,
        private readonly mongo: TypeOfMongoClient
    ) { }

    private readonly streamKey = "stream:app:info";
    private readonly groupName = "group-1";
    private lastConsumedStreamId: string = ""
    private consumerName = "consumer-1"
    private userBlance: Record<string, UserBalance> = {}
    private openOrders: Record<string, OpenOrders[]> = {}
    async run(): Promise<void> {
        await this.enginePuller.connect();
        await this.enginePusher.connect();
        await this.mongo.connect();

        try {
            await this.enginePuller.xGroupCreate(
                this.streamKey,
                this.groupName,
                "0",
                {
                    MKSTREAM: true,
                }
            )
        } catch (error) {
            console.log("group exists");
        }


        while (true) {

            try {
                if (this.lastConsumedStreamId !== "") {
                    this.enginePuller.xAck(
                        this.streamKey,
                        this.groupName,
                        this.lastConsumedStreamId);
                }


                const res = this.enginePuller.xReadGroup(
                    this.groupName,
                    this.consumerName,
                    { key: this.streamKey, id: ">" },
                    { BLOCK: 500, COUNT: 1 }
                )
                if (res && res[0]) {
                    const entry = res[0].message[0];
                    this.lastConsumedStreamId = entry.id;

                    try {
                        const msg = this.parseMessage(entry.message)
                        await this.handleMessage(msg)
                    } catch (error) {
                        console.error(error)

                    }

    private async handleMessage(msg: Message): Promise<void> {
        let res: EngineResponseType | undefined = undefined;
        switch (msg.type) {
            case "user-signup":
            case "user-signin":
                res = this.handleUserAuth(UserAuthMsg.parse(msg));
                break;
            case "price-update":
                await this.handlePriceUpdate(PriceUpdateMsg.parse(msg));
                break;
            case "trade-open":
                res = this.handleTradeOpen(TradeOpenMsg.parse(msg));
                break;
            case "trade-close":
                res = await this.handleTradeClose(TradeCloseMsg.parse(msg));
                break;
            case "get-asset-bal":
                res = this.handleGetAssetBal(GetAssetBalMsg.parse(msg));
                break;
            case "get-user-bal":
                res = this.handleGetUserBal(GetUserBalMsg.parse(msg));
                break;
            case "open-trades-fetch":
                res = this.handleOpenTradesFetch(OpenTradesFetchMsg.parse(msg));
                break;




        }

        private handleUserAuth(msg: z.infer<typeof UserAuthMsg>): EngineResponseType {
        const user = JSON.parse(msg.user) as {
            id: string,
            balance: number,
            decimal: number
        }

        if (!this.userBlance[user.id]) {
            this.userBlance[user.id] = {
                balance: user.balance,
                decimal: user.decimal
            }
        }

        if (!this.openOrders[user.id]) {
            this.openOrders[user.id] = [];
        };

        return {
            type: "user-signup/in-ack",
            reqId: msg.reqId,
            payload: "user added to in memmory sucessfully"
        }

    }







}


}
            } catch (error) {

}


        }



    }


}