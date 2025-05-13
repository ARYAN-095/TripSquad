import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/Auth";
import { authGuard } from "./middleware/authGuard";
import { IUser } from './models/User';
import itinerariesRouter from "./routes/itineraries";
 
declare global {
    namespace Express {
      interface Request {
        user?: IUser; // or just `any` if you're not strict
      }
    }
  }
 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRouter);
app.use("/api/itineraries", itinerariesRouter);
// After mounting authRouter

// Protected route example
app.get("/api/auth/me", authGuard, (req, res) => {
    // req.user is now populated
    res.json({ user: req.user });
  });
  

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
