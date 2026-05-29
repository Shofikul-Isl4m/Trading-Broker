import { authBodySchema } from "@repo/types/zodSchema";
import { json, Request, Response } from "express";
import { prisma } from "@repo/db"
import jwt from "jsonwebtoken"
import { httpPusher } from "@repo/redis/queue"

export const emailGenController = async (req: Request, res: Response) => {

    (async () => {
        httpPusher.connect();
    })

    const validInput = authBodySchema.safeParse(req.body);
    if (!validInput.success) {
        return res.status(404).json({
            message: "invalid input"
        })
    }

    const email = validInput.data.email;

    try {
        const reqId = Date.now().toString() + crypto.randomUUID();
        const userFound = await prisma.user.findFirst({

            where: {
                email,
            }
        })

        let user = userFound;
        if (!userFound) {
            const dbRes = prisma.user.create({
                data: {
                    email: email,
                    balance: 50000000,
                    decimal: 4,
                }
            })

            user = dbRes;
        }

        const jwtToken = jwt.sign(user?.id!, process.env.JWT_SECRET!)
        await httpPusher.xAdd("stream:app:info", "*", {
            type: "user-signup",
            user: JSON.stringify(user),
            reqId
        })
        await responseLoopObj.waitForResponse(reqId);

        // Send the secure cookie down first
        const { data, error } = await sendEmail(user!.email, jwtToken);

        if (error) {
            console.log("send email fails");
            res.status(400).json({ error });
            return;
        }

        res.json({
            message: "Email sent. Check your inbox and follow the link to log in.",
        });
        return;
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "Could not sign up, request timed out",
        });
        return;
    }




}

export const signInController = async (req: Request, res: Response) => {

    const token = req.query.token?.toString();
    if (!token) {
        console.log("Token not found");
        res.status(411).json({
            message: "Token not found",
        });
        return;
    }

    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET!) as string;

    try {
        const reqId = Date.now().toString() + crypto.randomUUID();
        const userFound = await prisma.user.findFirst({
            where: {
                id: verifiedToken
            }
        })
        if (!userFound?.email) {
            return res.status(401).json({
                message: "user not found"
            })
        }

        await httpPusher.xAdd("stream-app-info", "*", {
            type: "user-signin",
            user: JSON.stringify(userFound),
            reqId
        })
        await responseLoopObj.waitForResponse(reqId);

        res.cookie("jwt", token);
        res.redirect(new URL("/#/trade", process.env.CORS_ORIGIN).toString());


    } catch (error) {
        res.status(400).json({
            message: "could not sign in.request timedout"
        })

    }




}