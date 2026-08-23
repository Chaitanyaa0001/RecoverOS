import mongoose from "mongoose";
import dotenv from "dotenv";
import { env } from "./env.config.js";


dotenv.config();
const connectDB = async () => {
  try {
    if (!env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    const connection = await mongoose.connect(
      env.MONGODB_URI
    );

    console.log(
      `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;