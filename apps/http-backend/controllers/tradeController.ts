import { tradePusher } from "@repo/redis/queue";
import { closeOrderSchema, createOrderSchema } from "@repo/types/zodSchema";
import { Request, Response } from "express";
import { responseLoopObj } from "../utils/responseLoop";
import prismaClient from "@repo/db/client"

(
    async () => {
        await tradePusher.connect()
    }

)()

export const tradeOpenController = async (req: Request, res: Response) => {
    const validInput = createOrderSchema.safeParse(req.body);
    if (!validInput.success) {
        return res.status(411).json({
            message: "invalid input"
        })
    }

    const userId = (req as unknown as { userId: string }).userId;
    const reqId = Date.now().toString() + crypto.randomUUID();
    const tradeInfo = JSON.stringify(validInput.data);

    try {
        await tradePusher.xAdd("stream:app:info", "*", {
            type: "trade-open",
            tradeInfo,
            userId,
            reqId
        })

        const response = await responseLoopObj.waitForResponse(reqId)
        const { order, orderId } = JSON.parse(response!);
        res.json({
            message: "trade executed", order, orderId
        })

    } catch (error) {
        console.log(error);
        res.status(411).json({
            message: `trade not executed ${error}`, error

        })

    }

}


export const fetchOpenTrade = async (req: Request, res: Response) => {

    const userId = (req as unknown as { userId: string }).userId;
    const reqId = Date.now().toString() + crypto.randomUUID();

    try {
        await tradePusher.xAdd("stream:app:info", "*", {
            type: "open-trade-fetch",
            userId,
            reqId
        })

        const trades = await responseLoopObj.waitForResponse(reqId)
        return res.json({
            message: "trades fetched", trades
        })
    } catch (error) {
        console.log(error);
        res.status(411).json({
            message: "trades not fetched", error
        })
    }
}

export const closeTradeController = async (req: Request, res: Response) => {

    const validInput = closeOrderSchema.safeParse(req.body);
    const reqId = Date.now().toString() + crypto.randomUUID();
    const userId = (req as unknown as { userId: string }).userId;
    const orderId = validInput.data?.orderId!;
    try {
        await tradePusher.xAdd("stream:app:info", "*", {
            type: "trade-close",
            reqId,
            userId,
            orderId
        })
        await responseLoopObj.waitForResponse(reqId);
        res.json({ message: "trade closed" })
    } catch (error) {
        console.log(error);
        res.status(411).json({
            message: "trades are not executed", error
        })
    }


}


export const fetchClosedTrades = async (req: Request, res: Response) => {

    const userId = (req as unknown as { userId: string }).userId;

    try {
        const trades = await prismaClient.existingTrades.findFirst({
            where: { userId }
        })

        res.json({
            trades
        })
    } catch (error) {
        console.error(error);
        res.status(411).json({
            message: "faced some error", error
        })
    }



} 