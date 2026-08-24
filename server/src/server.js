import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { env } from "./config/env.config.js";
import connectDB from "./config/database.js";

await connectDB();

const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin:
      env.CLIENT_URL ||
      "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(
    `Socket connected: ${socket.id}`
  );

  socket.on("join-batch", (batchId) => {
    if (!batchId) return;
    socket.join(`batch:${batchId}`);
    console.log(`Socket ${socket.id} joined batch ${batchId}`);
  });

  socket.on("disconnect", () => {
    console.log(
      `Socket disconnected: ${socket.id}`
    );
  });
});

httpServer.listen(env.PORT, () => {
  console.log(
    `RecoverJS server running on port ${env.PORT}`
  );
});