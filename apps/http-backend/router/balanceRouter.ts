import { Router } from "express"
import { authMiddlware } from "../middleware/authMiddleware";

const balanceRouter: Router = Router();

balanceRouter.use(authMiddlware);
balanceRouter.get("/usd", getUsdBalanceController)
