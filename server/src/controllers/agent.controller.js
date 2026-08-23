import {
  runPipeline,
} from "../ai/pipeline.js";

import {
  runBatchPipeline,
} from "../service/recoveryBatch.service.js";

export const runAgentPipeline =
  async (
    req,
    res,
    next
  ) => {
    try {
      const event =
        await runPipeline(
          req.params.id
        );

      res.status(200).json({
        success: true,

        message:
          "RecoverJS AI pipeline completed.",

        event,
      });
    } catch (error) {
      next(error);
    }
  };


export const runBatchAgentPipeline =
  async (
    req,
    res,
    next
  ) => {
    try {

      const {
        batchId,
        concurrency = 5,
      } = req.body;

      if (!batchId) {
        return res.status(400).json({
          success: false,

          message:
            "batchId is required",
        });
      }

      const result =
        await runBatchPipeline(
          batchId,
          Math.min(
            Number(concurrency) || 5,
            10
          )
        );

      res.status(200).json({
        success: true,

        message:
          "Batch recovery pipeline completed.",

        ...result,
      });

    } catch (error) {
      next(error);
    }
  };