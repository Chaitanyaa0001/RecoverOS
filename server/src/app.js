import express from "express";
import cors from "cors";

import eventRoutes from "./routes/event.route.js";
import agentRoutes from "./routes/agent.route.js";
import webhookRoutes from "./routes/webhook.route.js";

const app = express();

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:3000",

    credentials: true,
  })
);

/* =========================================================
   RAZORPAY WEBHOOK
========================================================= */

app.use(
  "/api/webhook",
  express.raw({
    type: "application/json",
  }),
  webhookRoutes
);

/* =========================================================
   NORMAL BODY PARSERS
========================================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================================================
   ROUTES
========================================================= */

app.use(
  "/api/events",
  eventRoutes
);

app.use(
  "/api/agent",
  agentRoutes
);

/* =========================================================
   404
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "API error:",
      error
    );

    const statusCode =
      Number(error?.statusCode) ||
      Number(error?.status) ||
      500;

    res.status(statusCode).json({
      success: false,
      message:
        error?.message ||
        "Internal server error",
    });
  }
);

export default app;