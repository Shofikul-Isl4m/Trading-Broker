import { Router } from "express"
import { authMiddlware } from "../middleware/authMiddleware";
import { getAssetBalanceController, getUsdBalanceController } from "../controllers/balanceController";

export const balanceRouter: Router = Router();

balanceRouter.use(authMiddlware);
balanceRouter.get("/", getAssetBalanceController)
balanceRouter.get("/usd", getUsdBalanceController);
