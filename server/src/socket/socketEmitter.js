import { io } from "../server.js";

export const emitBatchEvent =
  (
    batchId,
    data
  ) => {

    if (!batchId) {
      return;
    }

    io.to(
      `batch:${batchId}`
    ).emit(
      "batch:event",
      {
        batchId,

        ...data,

        timestamp:
          new Date(),
      }
    );
  };