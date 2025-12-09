import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET  = process.env.REFRESH_TOKEN_SECRET !;

export interface IJwtPayload {
    userId: string;
    email:string;
}

// Generate access token
export function generateAccessToken(payLoad: IJwtPayload){
    return jwt.sign(payLoad, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
}

// Generate Refresh Token

export function generateRefreshToken(payLoad: IJwtPayload){
    return jwt.sign(payLoad, REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
}

// Verify Access Token
export function verifyAccessToken(token: string): IJwtPayload {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as IJwtPayload;
}

// Verify Refresh Token

export function verifyRefreshToken(token: string): IJwtPayload {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as IJwtPayload;
}