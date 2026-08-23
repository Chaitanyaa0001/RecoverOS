import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  deleteAllEvents,
  seedEvents,
} from "../service/event.service.js";

import {
  generateSyntheticBatch,
} from "../utils/generateSyntheticEvents.js";

export const listEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      batchId,
      search,
    } = req.query;

    const result = await getAllEvents({
      page: Number(page),
      limit: Math.min(Number(limit), 100),
      type,
      status,
      batchId,
      search,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const createNewEvent = async (req, res, next) => {
  try {
    const event = await createEvent(req.body);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExistingEvent = async (req, res, next) => {
  try {
    const event = await updateEvent(
      req.params.id,
      req.body
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExistingEvent = async (req, res, next) => {
  try {
    const event = await deleteEvent(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const clearEvents = async (req, res, next) => {
  try {
    const result = await deleteAllEvents();

    res.status(200).json({
      success: true,
      message: "All events deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

export const seedSyntheticEvents = async (req, res, next) => {
  try {
    const count = Math.min(
      Math.max(Number(req.body.count) || 10, 1),
      500
    );

    const batchId =
      req.body.batchId || `batch_${Date.now()}`;

    const isLiveDemoEvent =
      Boolean(req.body.isLiveDemoEvent);

    const replaceExisting =
      Boolean(req.body.replaceExisting);

    const events = generateSyntheticBatch(
      count,
      batchId,
      isLiveDemoEvent
    );

    const insertedEvents = await seedEvents(
      events,
      replaceExisting
    );

    res.status(201).json({
      success: true,
      message: "Synthetic events created successfully",
      batchId,
      count: insertedEvents.length,
      events: insertedEvents,
    });
  } catch (error) {
    next(error);
  }
};