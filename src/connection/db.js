import mongoose from "mongoose";
import secrets from "../../secrets.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(secrets.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit process with failure
  }
};
