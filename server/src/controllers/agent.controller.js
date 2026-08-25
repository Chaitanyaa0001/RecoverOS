import Event from "../models/Events.js";

import {
  runPipeline,
} from "../ai/pipeline.js";

import {
  runBatchPipeline,
} from "../service/recoveryBatch.service.js";

import {
  emitRecoveryEvent,
} from "../socket/socketEmitter.js";

/* =========================================================
   RUN SINGLE EVENT
========================================================= */

export const runAgentPipeline = async (
  req,
  res,
  next
) => {
  try {
    const eventId = req.params.id;

    /* =====================================================
       ATOMIC CLAIM

       Single-event execution allows explicit retry of FAILED.
    ===================================================== */

    const event =
      await Event.findOneAndUpdate(
        {
          _id: eventId,
          status: "In Progress",
          actionStatus: {
            $in: [
              "PENDING",
              "FAILED",
            ],
          },
        },
        {
          $set: {
            actionStatus:
              "PROCESSING",
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

    /* =====================================================
       NOT CLAIMED
    ===================================================== */

    if (!event) {
      const existingEvent =
        await Event.findById(
          eventId
        )
          .select(
            "_id id status actionStatus"
          )
          .lean();

      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          message:
            "Event not found.",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "Event is already being processed or is not eligible for recovery.",
        eventId,
        status:
          existingEvent.status,
        actionStatus:
          existingEvent.actionStatus,
      });
    }

    /* =====================================================
       SOCKET: STARTED
    ===================================================== */

    emitRecoveryEvent({
      eventId: event._id,
      eventExternalId: event.id,
      stage: "started",
      status: "PROCESSING",
      actionStatus:
        "PROCESSING",
      message:
        "Recovery pipeline started.",
    });

    /* =====================================================
       START PIPELINE

       IMPORTANT:
       Explicit single-event retry.
    ===================================================== */

    runPipeline(
      eventId,
      (progress) => {
        emitRecoveryEvent({
          ...progress,
          eventId,
          eventExternalId:
            event.id,
        });
      }
    ).catch(
      async (error) => {
        console.error(
          `Recovery event ${eventId} failed:`,
          error
        );

        await Event.findOneAndUpdate(
          {
            _id: eventId,
            actionStatus:
              "PROCESSING",
          },
          {
            $set: {
              actionStatus:
                "FAILED",
              status:
                "In Progress",
              outcome:
                error?.message ||
                "Recovery pipeline failed.",
            },
          }
        );

        emitRecoveryEvent({
          eventId,
          eventExternalId:
            event.id,
          stage: "error",
          status: "FAILED",
          actionStatus:
            "FAILED",
          message:
            error?.message ||
            "Recovery pipeline failed.",
        });
      }
    );

    return res.status(202).json({
      success: true,
      message:
        "Recovery processing started.",
      eventId,
      processingStarted: true,
    });

  } catch (error) {
    next(error);
  }
};

/* =========================================================
   RUN MULTIPLE EVENTS
========================================================= */

export const runBatchAgentPipeline =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        eventIds,
        concurrency = 5,
      } = req.body || {};

      if (
        !Array.isArray(
          eventIds
        ) ||
        eventIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "eventIds must be a non-empty array.",
        });
      }

      const uniqueEventIds = [
        ...new Set(eventIds),
      ];

      const workerConcurrency =
        Math.min(
          Math.max(
            Number(
              concurrency
            ) || 5,
            1
          ),
          10
        );

      /*
       * Background processing.
       *
       * The HTTP request returns immediately with 202.
       */

      runBatchPipeline(
        uniqueEventIds,
        workerConcurrency
      ).catch((error) => {
        console.error(
          "Batch recovery failed:",
          error
        );
      });

      return res.status(202).json({
        success: true,
        message:
          "Recovery processing started.",
        totalRequested:
          uniqueEventIds.length,
        concurrency:
          workerConcurrency,
        processingStarted: true,
      });

    } catch (error) {
      next(error);
    }
  };