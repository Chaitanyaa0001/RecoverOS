  import { io } from "../server.js";

  export const emitRecoveryEvent = (data) => {
    if (!data?.eventId && data?.stage !== "all_completed") {
      console.warn(
        "emitRecoveryEvent called without eventId"
      );
      return;
    }

    io.emit("recovery:event", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  };