import Event from "../models/Events.js";
import { runPipeline } from "../ai/pipeline.js";
import { emitRecoveryEvent } from "../socket/socketEmitter.js";

/* =========================================================
   BATCH PIPELINE
========================================================= */

export const runBatchPipeline = async (
  eventIds,
  concurrency = 5
) => {
  if (
    !Array.isArray(eventIds) ||
    eventIds.length === 0
  ) {
    return {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      results: [],
    };
  }

  const uniqueEventIds = [
    ...new Set(eventIds),
  ];

  const workerCount = Math.min(
    Math.max(
      Number(concurrency) || 5,
      1
    ),
    10,
    uniqueEventIds.length
  );

  let processed = 0;
  let successful = 0;
  let failed = 0;

  const results = [];

  /* =======================================================
     ATOMIC CLAIM

     IMPORTANT:
     Batch processing only claims PENDING events.

     PROCESSING events cannot be claimed by another worker.
     FAILED events are NOT automatically retried in the same
     batch.
  ======================================================= */

  const claimNextEvent = async () => {
    return Event.findOneAndUpdate(
      {
        _id: {
          $in: uniqueEventIds,
        },
        status: "In Progress",
        actionStatus: "PENDING",
      },
      {
        $set: {
          actionStatus: "PROCESSING",
        },
      },
      {
        new: true,
      }
    )
      .select(
        "_id id status actionStatus"
      )
      .lean();
  };

  /* =======================================================
     WORKER
  ======================================================= */

  const worker = async () => {
    while (true) {
      const event =
        await claimNextEvent();

      /*
       * No more eligible events.
       */
      if (!event) {
        return;
      }

      try {
        /* =================================================
           SOCKET: STARTED
        ================================================= */

        emitRecoveryEvent({
          eventId: event._id,
          eventExternalId: event.id,
          stage: "started",
          status: "PROCESSING",
          actionStatus: "PROCESSING",
          message:
            "Recovery pipeline started.",
        });

        /* =================================================
           RUN PIPELINE
        ================================================= */

        const result =
          await runPipeline(
            event._id,
            (progress) => {
              emitRecoveryEvent({
                ...progress,
                eventId: event._id,
                eventExternalId:
                  event.id,
              });
            }
          );

        /* =================================================
           RESULT ACCOUNTING

           Do NOT automatically consider every resolved
           pipeline call successful.

           Only EXECUTED is a successful autonomous action.
        ================================================= */

        if (
          result?.actionStatus ===
          "EXECUTED"
        ) {
          successful++;

          results.push({
            success: true,
            eventId: event._id,
            eventExternalId:
              event.id,
            status: result.status,
            action: result.action,
            actionStatus:
              result.actionStatus,
            recoveredAmount:
              result.recoveredAmount,
            paymentLink:
              result.paymentLink,
            outcome:
              result.outcome,
          });
        } else {
          failed++;

          results.push({
            success: false,
            eventId: event._id,
            eventExternalId:
              event.id,
            status: result?.status,
            action: result?.action,
            actionStatus:
              result?.actionStatus,
            recoveredAmount:
              result?.recoveredAmount,
            paymentLink:
              result?.paymentLink,
            outcome:
              result?.outcome ||
              "Recovery action was not executed.",
          });
        }

        /* =================================================
           SOCKET: COMPLETED
        ================================================= */

        emitRecoveryEvent({
          eventId: event._id,
          eventExternalId: event.id,
          stage: "completed",
          status: result?.status,
          action: result?.action,
          actionStatus:
            result?.actionStatus,
          recoveredAmount:
            result?.recoveredAmount,
          paymentLink:
            result?.paymentLink,
          outcome:
            result?.outcome,
          message:
            result?.actionResult ||
            result?.outcome ||
            "Recovery pipeline completed.",
        });

      } catch (error) {
        console.error(
          `Recovery event ${event._id} failed:`,
          error
        );

        /* =================================================
           RELEASE ONLY OUR PROCESSING CLAIM
        ================================================= */

        await Event.findOneAndUpdate(
          {
            _id: event._id,
            actionStatus: "PROCESSING",
          },
          {
            $set: {
              actionStatus: "FAILED",
              status: "In Progress",
              outcome:
                error?.message ||
                "Recovery pipeline failed.",
            },
          }
        );

        /* =================================================
           SOCKET: ERROR
        ================================================= */

        emitRecoveryEvent({
          eventId: event._id,
          eventExternalId: event.id,
          stage: "error",
          status: "FAILED",
          actionStatus: "FAILED",
          message:
            error?.message ||
            "Recovery pipeline failed.",
        });

        results.push({
          success: false,
          eventId: event._id,
          eventExternalId:
            event.id,
          error:
            error?.message ||
            "Recovery pipeline failed.",
        });

        failed++;
      }

      processed++;

      /* =================================================
         SOCKET: PROGRESS
      ================================================= */

      emitRecoveryEvent({
        eventId: event._id,
        eventExternalId: event.id,
        stage: "progress",
        processed,
        total: uniqueEventIds.length,
        successful,
        failed,
      });
    }
  };

  /* =======================================================
     START WORKERS
  ======================================================= */

  const workers = Array.from(
    {
      length: workerCount,
    },
    () => worker()
  );

  await Promise.all(workers);

  /* =======================================================
     ALL COMPLETED
  ======================================================= */

  emitRecoveryEvent({
    stage: "all_completed",
    status: "COMPLETED",
    total: uniqueEventIds.length,
    processed,
    successful,
    failed,
    message:
      "All eligible recovery events processed.",
  });

  return {
    total: uniqueEventIds.length,
    processed,
    successful,
    failed,
    results,
  };
};