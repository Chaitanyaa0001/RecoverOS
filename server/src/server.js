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
      env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(
      `Socket disconnected: ${socket.id}`,
      reason
    );
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`RecoverJS server running on port ${env.PORT}`
  );
});