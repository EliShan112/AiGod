import type { Request, Response, NextFunction } from "express";
import ExpressError from "../utils/ExpressError.js";
import { verifyAccessToken } from "../utils/jwt.js";


export const authMiddleware = (req: Request, res: Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return next(new ExpressError(401, "No Token Provided (custom)"));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decode = verifyAccessToken(token) as {userId: string; email: string};
        req.user = decode;
        next();
    } catch (error) {
        return next(new ExpressError(401, "Invalid or expired token (custom)"));
    }
}