import express from "express";

import {
  listEvents,
  getEvent,
  createNewEvent,
  updateExistingEvent,
  deleteExistingEvent,
  clearEvents,
  seedSyntheticEvents,
} from "../controllers/event.controller.js";

const router = express.Router();

router.get(
  "/",
  listEvents
);

router.post(
  "/seed",
  seedSyntheticEvents
);

router.get(
  "/:id",
  getEvent
);

router.post(
  "/",
  createNewEvent
);

router.patch(
  "/:id",
  updateExistingEvent
);

router.delete(
  "/:id",
  deleteExistingEvent
);

router.delete(
  "/",
  clearEvents
);

export default router;