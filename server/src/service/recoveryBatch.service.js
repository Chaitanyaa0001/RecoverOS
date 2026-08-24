import Event from "../models/Events.js";

import {
  runPipeline,
} from "../ai/pipeline.js";

import {emitBatchEvent,} from "../socket/socketEmitter.js";

export const runBatchPipeline =
  async (
    batchId,
    concurrency = 5
  ) => {

    const events =
      await Event.find({
        batchId,
        status: "In Progress",
        actionStatus: "PENDING",
      })
        .select("_id")
        .lean();

    if (!events.length) {
      emitBatchEvent(batchId, {
        stage: "batch_completed",
        status: "COMPLETED",
        total: 0,
        completed: 0,
        successful: 0,
        failed: 0,
        message:
          "No pending events found for this batch.",
      });

      return {
        batchId,
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        results: [],
      };
    }

    let index = 0;

    const results = [];

    /*
     * =====================================
     * BATCH STARTED
     * =====================================
     */

    emitBatchEvent(batchId, {
      stage: "batch_started",
      status: "PROCESSING",
      total: events.length,
      completed: 0,
      successful: 0,
      failed: 0,
      message:
        "RecoverJS batch recovery started.",
    });

    /*
     * =====================================
     * WORKER
     * =====================================
     */

    const worker = async () => {
      while (true) {

        const currentIndex =
          index++;

        if (
          currentIndex >=
          events.length
        ) {
          return;
        }

        const event =
          events[currentIndex];

        try {

          /*
           * =================================
           * EVENT STARTED
           * =================================
           */

          emitBatchEvent(batchId, {
            eventId: event._id,
            stage: "started",
            status: "PROCESSING",
            message:
              "Recovery pipeline started.",
          });

          /*
           * =================================
           * RUN PIPELINE
           *
           * Pass progress callback so every
           * pipeline stage reaches Socket.IO.
           * =================================
           */

          const result =
            await runPipeline(
              event._id,
              (progress) => {

                emitBatchEvent(
                  batchId,
                  progress
                );

              }
            );

          /*
           * =================================
           * SUCCESS
           * =================================
           */

          results.push({
            success: true,

            eventId:
              event._id,

            status:
              result.status,

            action:
              result.action,

            actionStatus:
              result.actionStatus,

            recoveredAmount:
              result.recoveredAmount,

            paymentLink:
              result.paymentLink || null,
          });

        } catch (error) {

          /*
           * =================================
           * EVENT FAILED
           * =================================
           */

          emitBatchEvent(batchId, {
            eventId: event._id,
            stage: "failed",
            status: "FAILED",
            message:
              error.message,
          });

          results.push({
            success: false,

            eventId:
              event._id,

            error:
              error.message,
          });
        }
      }
    };

    /*
     * =====================================
     * CONCURRENCY
     * =====================================
     */

    const workerCount =
      Math.min(
        Math.max(
          Number(concurrency) || 5,
          1
        ),
        10,
        events.length
      );

    const workers =
      Array.from(
        {
          length: workerCount,
        },
        () => worker()
      );

    await Promise.all(
      workers
    );

    /*
     * =====================================
     * BATCH SUMMARY
     * =====================================
     */

    const successful =
      results.filter(
        (result) =>
          result.success
      ).length;

    const failed =
      results.filter(
        (result) =>
          !result.success
      ).length;

    /*
     * =====================================
     * BATCH COMPLETED
     * =====================================
     */

    emitBatchEvent(batchId, {
      stage: "batch_completed",
      status: "COMPLETED",

      total:
        events.length,

      completed:
        results.length,

      successful,

      failed,

      message:
        "RecoverJS batch recovery completed.",
    });

    return {
      batchId,

      total:
        events.length,

      processed:
        results.length,

      successful,

      failed,

      results,
    };
  };