import express from "express";

import {
  runAgentPipeline,
  runBatchAgentPipeline,
} from "../controllers/agent.controller.js";

const router =
  express.Router();

router.post(
  "/run/:id",
  runAgentPipeline
);

router.post(
  "/run-batch",
  runBatchAgentPipeline
);

export default router;