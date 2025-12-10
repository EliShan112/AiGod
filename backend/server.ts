import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import "dotenv/config";
import cors from 'cors';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';

import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import ExpressError from "./utils/ExpressError.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

// Body parsers
app.use(cookieParser());
app.use(express.json());

// Routing
app.use("/api", chatRoutes);
app.use("/api/auth", userRoutes);

// 404 handler
app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Global Error Handler
app.use((err: ExpressError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

// DB and Server Start
mongoose.set("strictQuery", true);

const PORT = process.env.PORT || 8080;

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
