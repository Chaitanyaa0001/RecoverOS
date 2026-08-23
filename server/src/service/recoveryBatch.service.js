import Event from "../models/Events.js";

import {
  runPipeline,
} from "../ai/pipeline.js";

export const runBatchPipeline =
  async (
    batchId,
    concurrency = 5
  ) => {

    const events =
      await Event.find({
        batchId,
      })
      .select("_id")
      .lean();

    let index = 0;

    const results = [];

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
          const result =
            await runPipeline(
              event._id
            );

          results.push({
            success: true,

            eventId:
              event._id,

            status:
              result.status,
          });

        } catch (error) {

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

    const workers =
      Array.from(
        {
          length: Math.min(
            concurrency,
            events.length
          ),
        },
        () => worker()
      );

    await Promise.all(
      workers
    );

    return {
      batchId,

      total:
        events.length,

      processed:
        results.length,

      successful:
        results.filter(
          (r) => r.success
        ).length,

      failed:
        results.filter(
          (r) => !r.success
        ).length,

      results,
    };
  };