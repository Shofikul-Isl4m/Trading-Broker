import { Router } from "express";
import { balanceRouter } from "./balanceRouter";
import { userRouter } from "./userRouter";
import { tradeRouter } from "./tradeRouter";


const router: Router = Router();

router.use("/auth", userRouter);
router.use("/trade", tradeRouter)

router.use("/balance", balanceRouter);