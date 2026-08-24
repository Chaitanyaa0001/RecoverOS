import express from "express";
import cors from "cors";

import eventRoutes from "./routes/event.route.js";
import agentRoutes from "./routes/agent.route.js";
import webhookRoutes from "./routes/webhook.route.js";

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:3000",
    credentials: true,
  })
);

// Razorpay webhook
app.use(
  "/api/webhook",
  express.raw({
    type: "application/json",
  }),
  webhookRoutes
);

// Normal APIs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/events", eventRoutes);
app.use("/api/agent", agentRoutes);

export default app;