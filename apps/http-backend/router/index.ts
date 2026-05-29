import { Router } from "express";


const router: Router = Router();

router.use("/auth", userRouter);
router.use("/balance", balanceRouter);