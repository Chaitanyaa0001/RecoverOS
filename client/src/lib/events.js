import { api } from "./api";

/* =========================================================
   EVENT NORMALIZATION
========================================================= */

export function normalizeEvent(event) {
  if (!event) {
    return null;
  }

  const id =
    event._id?.toString() ||
    event.id ||
    event.eventId;

  return {
    ...event,
    id,
    amount: Number(event.amount) || 0,

    customer: event.customer || {
      id: "",
      name: "Unknown Customer",
      email: "",
      phone: "",
    },

    merchant: event.merchant || {
      id: "",
      name: "Unknown Merchant",
    },

    timeline: Array.isArray(event.timeline)
      ? event.timeline
      : [],

    alternatives: Array.isArray(event.alternatives)
      ? event.alternatives
      : [],

    actionStatus:
      event.actionStatus || "PENDING",

    status:
      event.status || "In Progress",
  };
}

/* =========================================================
   EXTRACT EVENT FROM SOCKET / API PAYLOAD
========================================================= */

function extractEvent(payload) {
  if (!payload) {
    return null;
  }

  return (
    payload.event ||
    payload.data ||
    payload.result ||
    payload
  );
}

/* =========================================================
   EXTRACT EVENTS FROM API RESPONSE
========================================================= */

function extractEvents(data) {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.events)) {
    return data.events;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  return [];
}

/* =========================================================
   GET ALL EVENTS
   Backend:
   GET /api/events
========================================================= */

export async function getEvents({
  page = 1,
  limit = 100,
  type,
  status,
  search,
} = {}) {
  try {
    const response = await api.get("/api/events", {
      params: {
        page,
        limit: Math.min(
          Number(limit) || 100,
          100
        ),

        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
      },
    });

    const data = response.data || {};

    const events = extractEvents(data)
      .map(normalizeEvent)
      .filter(Boolean);

    return {
      events,
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error(
      "getEvents failed:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
}

/* =========================================================
   GET ONE EVENT
   Backend:
   GET /api/events/:eventId
========================================================= */

export async function getEventById(eventId) {
  if (!eventId) {
    throw new Error("Event ID is required.");
  }

  try {
    const response = await api.get(
      `/api/events/${encodeURIComponent(eventId)}`
    );

    const event = extractEvent(response.data);

    return normalizeEvent(event);
  } catch (error) {
    console.error(
      "getEventById failed:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
}

/* =========================================================
   GENERATE TEST EVENTS

   Backend:
   POST /api/events/seed

   Body:
   {
     count: number,
     isLiveDemoEvent: false,
     replaceExisting: false
   }

   Example:
   {
     count: 10
   }
========================================================= */

export async function generateTestEvents(
  count = 8
) {
  const eventCount = Number(count);

  if (
    !Number.isInteger(eventCount) ||
    eventCount < 1
  ) {
    throw new Error(
      "Event count must be a positive integer."
    );
  }

  if (eventCount > 100) {
    throw new Error(
      "You can generate a maximum of 100 events at once."
    );
  }

  try {
    const response = await api.post(
      "/api/events/seed",
      {
        count: eventCount,
        isLiveDemoEvent: false,
        replaceExisting: false,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "generateTestEvents failed:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
}

/* =========================================================
   RUN ONE EVENT

   Backend:
   POST /api/agent/run/:eventId
========================================================= */

export async function runEvent(eventId) {
  if (!eventId) {
    throw new Error("Event ID is required.");
  }

  try {
    const response = await api.post(
      `/api/agent/run/${encodeURIComponent(eventId)}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "runEvent failed:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
}

/* =========================================================
   RUN SELECTED EVENTS

   Backend:
   POST /api/agent/run-batch

   Body:
   {
     eventIds: [],
     concurrency: 5
   }
========================================================= */

export async function runEvents(
  eventIds,
  concurrency = 5
) {
  if (
    !Array.isArray(eventIds) ||
    eventIds.length === 0
  ) {
    throw new Error(
      "At least one event ID is required."
    );
  }

  const uniqueEventIds = [
    ...new Set(
      eventIds.filter(Boolean)
    ),
  ];

  if (uniqueEventIds.length === 0) {
    throw new Error(
      "No valid event IDs found."
    );
  }

  try {
    const response = await api.post(
      "/api/agent/run-batch",
      {
        eventIds: uniqueEventIds,
        concurrency: Math.min(
          Math.max(
            Number(concurrency) || 5,
            1
          ),
          10
        ),
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "runEvents failed:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
}

/* =========================================================
   RUN ALL EVENTS

   Fetches current events and sends their IDs
   to /api/agent/run-batch
========================================================= */

export async function runAllEvents(
  concurrency = 5
) {
  const result = await getEvents({
    page: 1,
    limit: 100,
  });

  const eventIds = result.events
    .map((event) => event.id)
    .filter(Boolean);

  if (eventIds.length === 0) {
    throw new Error(
      "No events available to process."
    );
  }

  return runEvents(
    eventIds,
    concurrency
  );
}

/* =========================================================
   REFRESH EVENT
========================================================= */

export async function refreshEvent(eventId) {
  return getEventById(eventId);
}

/* =========================================================
   DELETE ALL EVENTS

   Backend:
   DELETE /api/events
========================================================= */

export async function deleteTestEvents() {
  try {
    const response = await api.delete(
      "/api/events"
    );

    return response.data;
  } catch (error) {
    console.error(
      "deleteTestEvents failed:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
}

/* =========================================================
   DELETE ONE EVENT

   Backend:
   DELETE /api/events/:eventId
========================================================= */

export async function deleteEvent(eventId) {
  if (!eventId) {
    throw new Error("Event ID is required.");
  }

  try {
    const response = await api.delete(
      `/api/events/${encodeURIComponent(eventId)}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "deleteEvent failed:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
}