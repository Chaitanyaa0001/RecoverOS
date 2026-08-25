import express from "express";

import {
  runAgentPipeline,
  runBatchAgentPipeline,
} from "../controllers/agent.controller.js";

const router = express.Router();

/* =========================================================
   SINGLE EVENT
========================================================= */

router.post(
  "/run/:id",
  runAgentPipeline
);

/* =========================================================
   MULTIPLE EVENTS
========================================================= */

router.post(
  "/run-batch",
  runBatchAgentPipeline
);

export default router;