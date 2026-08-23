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

app.use(express.json());

app.use(express.urlencoded({extended: true,}));
// Event APIs
app.use("/api/events",eventRoutes);
// AI pipeline APIs
app.use("/api/agent",agentRoutes);
app.use("/api/webhook",webhookRoutes);


export default app;