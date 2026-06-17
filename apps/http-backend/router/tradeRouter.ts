import { Router } from "express";
import { authMiddlware } from "../middleware/authMiddleware";
import { closeTradeController, fetchClosedTrades, fetchOpenTrade, tradeOpenController } from "../controllers/tradeController";

export const tradeRouter: Router = Router()

tradeRouter.use(authMiddlware);
tradeRouter.post("/open", tradeOpenController)
tradeRouter.get("/open", fetchOpenTrade)
tradeRouter.post("/close", closeTradeController)
tradeRouter.get("/closed", fetchClosedTrades)