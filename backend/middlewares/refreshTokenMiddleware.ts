import type { Request, Response, NextFunction } from "express";
import ExpressError from "../utils/ExpressError.js";
import { verifyRefreshToken } from "../utils/jwt.js";


export const requireRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    // Get the token specifically from the cookie
    const token = req.cookies?.refreshToken;

    if(!token) {
        return next(new ExpressError(401, "No refresh Token provided (Custom)"));
    }

    try {
        // Use your helper function to verify the STRING
        const payload = verifyRefreshToken(token);
        // Attach user data to request
        req.user = payload;
        next();
    } catch (err) {
        return next(new ExpressError(403, "Invalid Refresh Token"));
    }
}