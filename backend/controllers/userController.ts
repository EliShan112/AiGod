import type { Request, Response, NextFunction, CookieOptions } from "express";
import ExpressError from "../utils/ExpressError.js";
import { User } from "../model/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  type IJwtPayload,
} from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict", // Protects against CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, username, password } = req.body;

    //validationg
    if (!email || !username || !password) {
      throw new ExpressError(400, "Email, username, password are required");
    }

    //checking if email and username exist
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);

    if (existingEmail) throw new ExpressError(409, "Email already in use");
    if (existingUsername) throw new ExpressError(409, "Username already taken");

    //creating new user if not exist
    const user = new User({
      email,
      username,
      password,
    });

    //generating jwt payload
    const payload = { userId: user._id.toString(), email: user.email };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    //storing refreshtoken in db
    const salt = await bcrypt.genSalt(12);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    user.refreshTokens = [hashedRefreshToken];

    //saving now in db
    await user.save();

    //sending refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // sendiing response (never send password, for my future)
    res.status(201).json({
      message: "Sign successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      tokens: {
        accessToken,
      },
    });
  } catch (err) {
    console.log("Signup unknown error (custom)", err);
    next(err);
  }
};

export const logIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ExpressError(400, "Email, User and password are required");
    }

    //finding user
    const user = await User.findOne({ email });
    if (!user) {
      throw new ExpressError(401, "No User Found");
    }

    //matching password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ExpressError(401, "Invalid email or password");
    }

    //creating new jwt payload
    const payload = { userId: user._id.toString(), email: user.email };

    // new tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Refresh Token ROTATION (learned new, its good for security)
    // Clear old tokens, store new hashed refresh token
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    //if we want to logout from everywhere once login at single place, we do
    // user.refreshTokens = [hashedRefreshToken];
    // But if we want to stay logged in
    let newRefreshTokens = [...user.refreshTokens, hashedRefreshToken];
    //if user is loggedin in more than 5 device, removed oldest one
    if (newRefreshTokens.length > 5) {
      newRefreshTokens = newRefreshTokens.slice(-5); // removing oldest one
    }
    user.refreshTokens = newRefreshTokens;
    await user.save();

    //sending refresh token in httpOnly
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // sending response

    res.status(200).json({
      message: "Login successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      accessToken,
    });
  } catch (err) {
    next(err);
    console.log("Error during logging in (custom)", err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // get the cookie
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      throw new ExpressError(401, "Refresh Token Missing");
    }

    // Verify the JWT Signature (is it expired? is it fake?)
    let payload: IJwtPayload;
    try {
      payload = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as IJwtPayload;
    } catch (err) {
      // If verify fails (expired or invalid signature), we must clear the cookie
      res.clearCookie("refreshToken");
      throw new ExpressError(403, "Invalid Refresh Token (custom)");
    }

    //finding user
    const user = await User.findById(payload.userId);
    if (!user) {
      res.clearCookie("refreshToken");
      throw new ExpressError(401, "User not found");
    }

    //Match incoming refresh token with stored hashed tokens
    let matchedTokenIndex = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      const isMatch = await bcrypt.compare(
        incomingRefreshToken,
        user.refreshTokens[i]
      );
      if (isMatch) {
        matchedTokenIndex = i;
        break;
      }
    }

    // REUSE DETECTION (Security Critical)
    // If the token is valid JWT but NOT in the DB, it means it was already used/rotated.
    // This implies the user is being attacked.
    if (matchedTokenIndex === -1) {
      // OPTIONAL STRICT MODE: invalidating all tokens for safety
      // user.refreshTokens = [];
      // await user.save();
      res.clearCookie("refreshToken");
      throw new ExpressError(403, "Refresh token reused or invalid");
    }

    //ROTATION: Remove the old one, Add a new one
    // Remove the used token from array
    const newRefreshTokens = user.refreshTokens.filter(
      (_, index) => index !== matchedTokenIndex
    );

    //Gen new token
    const newPayload = { userId: user._id.toString(), email: user.email };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    //hashing new refresh token
    const salt = await bcrypt.genSalt(10);
    const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, salt);

    //pushing in array and saving
    newRefreshTokens.push(newHashedRefreshToken);
    user.refreshTokens = newRefreshTokens;
    await user.save();

    //sending new cookie and access token
    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    // If anything fails in the refresh flow, clear the cookie to prevent loops
    if (!res.headersSent) res.clearCookie("refreshToken");
    next(err);
  }
};

export const logOut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;
    if (!incomingRefreshToken) {
      return res.sendStatus(204);
    }

    const payload: IJwtPayload | null = jwt.decode(
      incomingRefreshToken
    ) as IJwtPayload | null;

    if (payload?.userId) {
      const user = await User.findById(payload.userId);

      if (user) {
        // Remove the specific token that matched
        // We have to filter async, which is tricky.
        // Simpler approach: construct a new array of tokens that DO NOT match
        const newTokens: string[] = [];
        for (const hashedToken of user.refreshTokens) {
          const isMatch = await bcrypt.compare(
            incomingRefreshToken,
            hashedToken
          );
          if (!isMatch) {
            newTokens.push(hashedToken);
          }
        }
        user.refreshTokens = newTokens;
        await user.save();
      }
    }

    //always clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};
