import Event from "../models/Events.js";

/* =========================================================
   GET ALL EVENTS
========================================================= */

export const getAllEvents = async ({
  page = 1,
  limit = 20,
  type,
  status,
  search,
} = {}) => {
  const query = {};

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      {
        _id: {
          $regex: search,
          $options: "i",
        },
      },
      {
        "customer.name": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "customer.email": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "merchant.name": {
          $regex: search,
          $options: "i",
        },
      },
      {
        companyName: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip = (safePage - 1) * safeLimit;

  const [events, total] = await Promise.all([
    Event.find(query)
      .sort({ detectedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),

    Event.countDocuments(query),
  ]);

  return {
    events,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
      hasNextPage: safePage * safeLimit < total,
      hasPreviousPage: safePage > 1,
    },
  };
};

/* =========================================================
   GET EVENT
========================================================= */

export const getEventById = async (eventId) => {
  return Event.findById(eventId).lean();
};

/* =========================================================
   CREATE EVENT
========================================================= */

export const createEvent = async (eventData) => {
  if (!eventData?._id) {
    throw Object.assign(
      new Error("Event _id is required."),
      { statusCode: 400 }
    );
  }

  const existingEvent = await Event.findById(
    eventData._id
  );

  if (existingEvent) {
    throw Object.assign(
      new Error(
        `Event ${eventData._id} already exists`
      ),
      { statusCode: 409 }
    );
  }

  const event = await Event.create(eventData);

  return event.toObject();
};

/* =========================================================
   UPDATE
========================================================= */

export const updateEvent = async (
  eventId,
  updateData
) => {
  return Event.findByIdAndUpdate(
    eventId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).lean();
};

/* =========================================================
   DELETE
========================================================= */

export const deleteEvent = async (eventId) => {
  return Event.findByIdAndDelete(eventId).lean();
};

/* =========================================================
   DELETE ALL
========================================================= */

export const deleteAllEvents = async () => {
  return Event.deleteMany({});
};

/* =========================================================
   SEED
========================================================= */

export const seedEvents = async (
  events,
  replaceExisting = false
) => {
  if (!Array.isArray(events) || events.length === 0) {
    return [];
  }

  if (replaceExisting) {
    await Event.deleteMany({});
  }

  return Event.insertMany(events, {
    ordered: false,
  });
};