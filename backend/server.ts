import express from 'express';
import "dotenv/config";
import cors from 'cors';
import mongoose from 'mongoose';
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(express.json());
app.use(cors())

//routing
app.use("/api", chatRoutes);

const PORT = 8080;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("Connected with Database")
    } catch (err) {
        console.log("Database error occured (custom): ", err);
    }
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});