import { Router } from "express";
import { emailGenController } from "../controllers/userController";



const userRouter = Router();

userRouter.route("/signup").post(emailGenController);
userRouter.route("/signin/post").get(signInController)
