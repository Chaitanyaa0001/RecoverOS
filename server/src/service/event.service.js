import Event from "../models/Events.js";

export const getAllEvents = async ({page = 1,limit = 20,type,status,batchId,search,} = {}) => {
  const query = {};
  if (type) {
    query.type = type;
  }
  if (status) {
    query.status = status;
  }
  if (batchId) {
    query.batchId = batchId;
  }
  if (search) {
    query.$or = [
      { _id: { $regex: search, $options: "i" } },
      { "customer.name": { $regex: search, $options: "i" } },
      { "customer.email": { $regex: search, $options: "i" } },
      { "merchant.name": { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (page - 1) * limit;
  const [events, total] = await Promise.all([
    Event.find(query)
      .sort({ detectedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Event.countDocuments(query),
  ]);

  return {events,pagination: {page,limit,total,totalPages: Math.ceil(total / limit),hasNextPage: page * limit < total,hasPreviousPage: page > 1,
    },
  };
};

export const getEventById = async (eventId) => {
  return Event.findById(eventId).lean();
};

export const createEvent = async (eventData) => {
  const existingEvent = await Event.findById(eventData._id);

  if (existingEvent) {
    const error = new Error(
      `Event ${eventData._id} already exists`
    );

    error.statusCode = 409;

    throw error;
  }

  const event = await Event.create(eventData);

  return event.toObject();
};

export const updateEvent = async (eventId, updateData) => {
  return Event.findByIdAndUpdate(
    eventId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).lean();
};

export const deleteEvent = async (eventId) => {
  return Event.findByIdAndDelete(eventId).lean();
};

export const deleteAllEvents = async () => {
  return Event.deleteMany({});
};

export const seedEvents = async (events, replaceExisting = false) => {
  if (replaceExisting) {
    await Event.deleteMany({});
  }

  return Event.insertMany(events, {
    ordered: false,
  });
};