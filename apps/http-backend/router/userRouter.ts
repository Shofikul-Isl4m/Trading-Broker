import { Router } from "express";
import { emailGenController, signInController } from "../controllers/userController";



export const userRouter: Router = Router();

userRouter.route("/signup").post(emailGenController);
userRouter.route("/signin/post").get(signInController)
