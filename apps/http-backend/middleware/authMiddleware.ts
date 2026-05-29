import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express";


export const authMiddlware = (req: Request, res: Response, next: NextFunction) => {

    const jwtToken = req.cookies.jwt;

    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET!);
    if (!decodedToken) {
        return res.status(401).json({
            message: "user not authorized"
        })

    }

    req.userId = decodedToken;
    next();

}