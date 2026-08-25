import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

let socket = null;

/* =========================================================
   GET SOCKET
========================================================= */
export function getSocket() {
  if (typeof window === "undefined") {
    return null;
  }
  if (socket) {
    return socket;
  }
  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    autoConnect: true,
  });
  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });
  socket.on("connect_error", (error) => {
    console.error(
      "[Socket] Connection error:",
      error?.message
    );
  });
  return socket;
}

/* =========================================================
   CONNECT
========================================================= */
export function connectSocket() {
  const client = getSocket();
  if (!client) {
    return null;
  }
  if (!client.connected) {
    client.connect();
  }
  return client;
}

/* =========================================================
   DISCONNECT
========================================================= */
export function disconnectSocket() {
  if (!socket) {
    return;
  }
  socket.disconnect();
  socket = null;
}
/* =========================================================
   GLOBAL EVENT UPDATES
   Backend should emit:
   event-updated
   Payload can be:
   {
     event: {...}
   }
   OR directly:
   {
     id: "...",
     actionStatus: "EXECUTED"
   }
========================================================= */
export function subscribeToEvents(callback) {
  const client = connectSocket();
  if (!client) {
    return () => {};
  }
  const handler = (payload) => {
    callback?.(payload);
  };
  client.on("event-updated", handler);
  return () => {
    client.off("event-updated", handler);
  };
}

/* =========================================================
   EVENTS CREATED
   Backend should emit:
   events-created
   Payload can be:
   {
     events: [...]
   }
   OR:
   {
     event: {...}
   }
   OR:
   {
     count: 8
   }
========================================================= */
export function subscribeToEventsCreated(callback) {
  const client = connectSocket();
  if (!client) {
    return () => {};
  }
  const handler = (payload) => {
    callback?.(payload);
  };
  client.on("events-created", handler);
  return () => {
    client.off("events-created", handler);
  };
}
/* =========================================================
   SINGLE EVENT CREATED
   Supports backend emitting:
   event-created
========================================================= */
export function subscribeToEventCreated(callback) {
  const client = connectSocket();
  if (!client) {
    return () => {};
  }
  const handler = (payload) => {
    callback?.(payload);
  };
  client.on("event-created", handler);
  return () => {
    client.off("event-created", handler);
  };
}
/* =========================================================
   EVENT DELETED
========================================================= */
export function subscribeToEventDeleted(callback) {
  const client = connectSocket();
  if (!client) {
    return () => {};
  }
  const handler = (payload) => {
    callback?.(payload);
  };
  client.on("event-deleted", handler);
  return () => {
    client.off("event-deleted", handler);
  };
}
/* =========================================================
   EVENTS DELETED
========================================================= */
export function subscribeToEventsDeleted(callback) {
  const client = connectSocket();
  if (!client) {
    return () => {};
  }
  const handler = (payload) => {
    callback?.(payload);
  };
  client.on("events-deleted", handler);
  return () => {
    client.off("events-deleted", handler);
  };
}