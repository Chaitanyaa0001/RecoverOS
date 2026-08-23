import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL:process.env.CLIENT_URL ,
  MONGODB_URI:process.env.MONGODB_URI,
  // NVIDIA
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  NVIDIA_MODEL: process.env.NVIDIA_MODEL ||"nvidia/nemotron-3.5-lightning-30b-a3b",
  NVIDIA_BASE_URL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
  // Brevo
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME ||"RecoverJS",
  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};