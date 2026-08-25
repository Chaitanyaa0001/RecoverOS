"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Mail,
  Phone,
  Link2,
  UserRound,
  Plus,
  Play,
  Loader2,
  RotateCw,
  Trash2,
} from "lucide-react";

import FilterSelect from "./filterSelect";
import EventDrawer from "./eventDrawer";

import {
  getEvents,
  getEventById,
  generateTestEvents,
  runAllEvents,
  deleteTestEvents,
} from "../../lib/events";

import {
  connectSocket,
  subscribeToEvents,
  subscribeToEventsCreated,
  subscribeToEventCreated,
  subscribeToEventDeleted,
  subscribeToEventsDeleted,
} from "../../lib/socket";

const actionConfig = {
  EMAIL: {
    label: "Send Dunning Email",
    icon: Mail,
  },

  VOICE: {
    label: "Hinglish Voice Recovery",
    icon: Phone,
  },

  SMART_RETRY: {
    label: "Smart Retry",
    icon: RotateCw,
  },

  PAYMENT_LINK: {
    label: "Create Payment Link",
    icon: Link2,
  },

  ACCOUNT_MANAGER: {
    label: "Account Manager",
    icon: UserRound,
  },
};

export default function EventsClient({
  initialEvents = [],
}) {
  const [events, setEvents] = useState(
    Array.isArray(initialEvents)
      ? initialEvents
      : []
  );

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    customer: "All Customers",
    type: "All Types",
    rootCause: "All Causes",
    action: "All Actions",
  });

  /* =========================================================
     EVENT GENERATION COUNT
  ========================================================= */

  const [eventCount, setEventCount] =
    useState(8);

  const [generating, setGenerating] =
    useState(false);

  const [running, setRunning] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [loadingEvents, setLoadingEvents] =
    useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =========================================================
     LOAD EVENTS
  ========================================================= */

  const loadEvents = useCallback(
    async () => {
      try {
        setLoadingEvents(true);

        const result =
          await getEvents();

        const latestEvents =
          Array.isArray(result?.events)
            ? result.events
            : [];

        setEvents(latestEvents);

        setSelectedEvent(
          (current) => {
            if (!current?.id) {
              return current;
            }

            const latest =
              latestEvents.find(
                (event) =>
                  event.id ===
                  current.id
              );

            return latest || current;
          }
        );
      } catch (error) {
        console.error(
          "Failed to load events:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load events."
        );
      } finally {
        setLoadingEvents(false);
      }
    },
    []
  );

  /* =========================================================
     REFRESH ONE EVENT
  ========================================================= */

  const refreshSingleEvent =
    useCallback(
      async (eventId) => {
        if (!eventId) {
          return;
        }

        try {
          const latest =
            await getEventById(
              eventId
            );

          if (!latest) {
            return;
          }

          setEvents(
            (previous) =>
              previous.map(
                (event) =>
                  event.id ===
                  latest.id
                    ? latest
                    : event
              )
          );

          setSelectedEvent(
            (current) =>
              current?.id ===
              latest.id
                ? latest
                : current
          );
        } catch (error) {
          console.error(
            "Failed to refresh event:",
            error
          );
        }
      },
      []
    );

  /* =========================================================
     SOCKET CONNECTION + EVENTS
  ========================================================= */

  useEffect(() => {
    connectSocket();

    const unsubscribeUpdated =
      subscribeToEvents(
        async (payload) => {
          console.log(
            "[Socket] Event updated:",
            payload
          );

          const socketEvent =
            payload?.event ||
            payload?.data ||
            payload;

          const eventId =
            socketEvent?.id ||
            socketEvent?._id ||
            socketEvent?.eventId;

          if (!eventId) {
            await loadEvents();
            return;
          }

          if (
            socketEvent &&
            (
              socketEvent.actionStatus ||
              socketEvent.status ||
              socketEvent.timeline
            )
          ) {
            const normalizedEvent = {
              ...socketEvent,
              id:
                socketEvent.id ||
                socketEvent._id?.toString(),
            };

            setEvents(
              (previous) =>
                previous.map(
                  (event) =>
                    event.id ===
                    normalizedEvent.id
                      ? {
                          ...event,
                          ...normalizedEvent,
                        }
                      : event
                )
            );

            setSelectedEvent(
              (current) =>
                current?.id ===
                normalizedEvent.id
                  ? {
                      ...current,
                      ...normalizedEvent,
                    }
                  : current
            );
          }

          await refreshSingleEvent(
            eventId
          );
        }
      );

    const unsubscribeCreated =
      subscribeToEventsCreated(
        async (payload) => {
          console.log(
            "[Socket] Events created:",
            payload
          );

          await loadEvents();
        }
      );

    const unsubscribeSingleCreated =
      subscribeToEventCreated(
        async (payload) => {
          console.log(
            "[Socket] Event created:",
            payload
          );

          const socketEvent =
            payload?.event ||
            payload?.data ||
            payload;

          const eventId =
            socketEvent?.id ||
            socketEvent?._id;

          if (!eventId) {
            await loadEvents();
            return;
          }

          await refreshSingleEvent(
            eventId
          );
        }
      );

    const unsubscribeDeleted =
      subscribeToEventDeleted(
        async (payload) => {
          console.log(
            "[Socket] Event deleted:",
            payload
          );

          const eventId =
            payload?.eventId ||
            payload?.id ||
            payload?.event?._id ||
            payload?.event?.id;

          if (!eventId) {
            await loadEvents();
            return;
          }

          setEvents(
            (previous) =>
              previous.filter(
                (event) =>
                  event.id !==
                  eventId
              )
          );

          setSelectedEvent(
            (current) =>
              current?.id === eventId
                ? null
                : current
          );
        }
      );

    const unsubscribeAllDeleted =
      subscribeToEventsDeleted(
        async () => {
          console.log(
            "[Socket] Events deleted"
          );

          setSelectedEvent(null);

          await loadEvents();
        }
      );

    loadEvents();

    return () => {
      unsubscribeUpdated?.();
      unsubscribeCreated?.();
      unsubscribeSingleCreated?.();
      unsubscribeDeleted?.();
      unsubscribeAllDeleted?.();
    };
  }, [
    loadEvents,
    refreshSingleEvent,
  ]);

  /* =========================================================
     FALLBACK POLLING
  ========================================================= */

  useEffect(() => {
    const interval =
      setInterval(() => {
        loadEvents();
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [loadEvents]);

  /* =========================================================
     GENERATE EVENTS
  ========================================================= */

  const handleGenerateEvents =
    async () => {
      const count = Number(eventCount);

      if (
        !Number.isInteger(count) ||
        count < 1
      ) {
        setError(
          "Please enter a valid number of events."
        );

        return;
      }

      if (count > 100) {
        setError(
          "You can generate a maximum of 100 events at once."
        );

        return;
      }

      try {
        setGenerating(true);
        setError("");
        setSuccessMessage("");

        const result =
          await generateTestEvents(
            count
          );

        await loadEvents();

        setSuccessMessage(
          `${
            result?.count ??
            result?.createdCount ??
            count
          } events generated successfully.`
        );
      } catch (error) {
        console.error(
          "Generate events failed:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to generate events."
        );
      } finally {
        setGenerating(false);
      }
    };

  /* =========================================================
     DELETE ALL EVENTS
  ========================================================= */

  const handleDeleteAllEvents =
    async () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete ALL test events? This cannot be undone."
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeleting(true);
        setError("");
        setSuccessMessage("");

        setSelectedEvent(null);

        const result =
          await deleteTestEvents();

        setEvents([]);

        setSuccessMessage(
          `${
            result?.deletedCount ??
            result?.count ??
            "All"
          } test events deleted successfully.`
        );
      } catch (error) {
        console.error(
          "Delete test events failed:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to delete test events."
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =========================================================
     RUN ALL EVENTS
  ========================================================= */

  const handleRunRecovery =
    async () => {
      if (events.length === 0) {
        setError(
          "Generate events first."
        );

        return;
      }

      if (running) {
        return;
      }
try {
  setRunning(true);

  const result = await runAllEvents(5);

  setSuccessMessage(
    result?.message ||
      "Recovery processing started. Watching live agent updates..."
  );

  await loadEvents();

} catch (error) {
  setError(
    error?.response?.data?.message ||
      error?.message ||
      "Failed to run recovery."
  );
} finally {
  setRunning(false);
}
    };

  /* =========================================================
     EVENT UPDATED FROM DRAWER
  ========================================================= */

  const handleEventUpdated =
    (updatedEvent) => {
      if (!updatedEvent?.id) {
        return;
      }

      setEvents(
        (previous) =>
          previous.map(
            (event) =>
              event.id ===
              updatedEvent.id
                ? updatedEvent
                : event
          )
      );

      setSelectedEvent(
        (current) =>
          current?.id ===
          updatedEvent.id
            ? updatedEvent
            : current
      );
    };

  /* =========================================================
     CUSTOMER OPTIONS
  ========================================================= */

  const customerOptions =
    useMemo(() => {
      const customers =
        events
          .map(
            (event) =>
              event.customer?.name
          )
          .filter(Boolean);

      return [
        "All Customers",
        ...new Set(customers),
      ];
    }, [events]);

  /* =========================================================
     FILTER EVENTS
  ========================================================= */

  const filteredEvents =
    useMemo(() => {
      const searchValue =
        search
          .toLowerCase()
          .trim();

      return events.filter(
        (event) => {
          const customerName =
            event.customer?.name
              ?.toLowerCase() || "";

          const customerEmail =
            event.customer?.email
              ?.toLowerCase() || "";

          const rootCause =
            (
              event.rootCauseLabel ||
              event.rootCause ||
              ""
            ).toLowerCase();

          const eventId =
            event.id
              ?.toLowerCase() || "";

          const eventType =
            event.type
              ?.toLowerCase() || "";

          const invoiceNumber =
            event.invoiceNumber
              ?.toLowerCase() || "";

          const matchesSearch =
            !searchValue ||
            eventId.includes(
              searchValue
            ) ||
            customerName.includes(
              searchValue
            ) ||
            customerEmail.includes(
              searchValue
            ) ||
            rootCause.includes(
              searchValue
            ) ||
            eventType.includes(
              searchValue
            ) ||
            invoiceNumber.includes(
              searchValue
            );

          const matchesCustomer =
            filters.customer ===
              "All Customers" ||
            event.customer?.name ===
              filters.customer;

          const matchesType =
            filters.type ===
              "All Types" ||
            event.type ===
              filters.type;

          const matchesRootCause =
            filters.rootCause ===
              "All Causes" ||
            event.rootCauseLabel ===
              filters.rootCause;

          const matchesAction =
            filters.action ===
              "All Actions" ||
            event.recommendedAction ===
              filters.action;

          return (
            matchesSearch &&
            matchesCustomer &&
            matchesType &&
            matchesRootCause &&
            matchesAction
          );
        }
      );
    }, [
      events,
      search,
      filters,
    ]);

  /* =========================================================
     VOICE REFRESH
  ========================================================= */

  const handleVoiceRecovery =
    async (eventId) => {
      await refreshSingleEvent(
        eventId
      );
    };

  const hasEvents =
    filteredEvents.length > 0;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f8fafb]">

      <header className="flex min-h-[70px] w-full items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-5">

        <div className="min-w-0">
          <h1 className="text-[15px] font-semibold text-slate-800">
            Revenue Events
          </h1>

          <p className="mt-0.5 truncate text-[10px] text-slate-400">
            AI-detected recovery events across payment activity
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </div>

      </header>

      <main className="w-full min-w-0 space-y-4 p-3 sm:p-4 lg:p-5">

        {/* =====================================================
            TEST CONTROLS
        ===================================================== */}

        <section className="rounded-lg border border-slate-200 bg-white p-3">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-[11px] font-semibold text-slate-700">
                Recovery Test Controls
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                Generate revenue-risk events, then execute recovery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              {/* EVENT COUNT INPUT */}

              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2">

                <label
                  htmlFor="event-count"
                  className="whitespace-nowrap text-[9px] font-medium text-slate-500"
                >
                  Events
                </label>

                <input
                  id="event-count"
                  type="number"
                  min="1"
                  max="100"
                  value={eventCount}
                  onChange={(e) =>
                    setEventCount(
                      e.target.value
                    )
                  }
                  disabled={
                    generating ||
                    deleting ||
                    running
                  }
                  className="w-16 bg-transparent py-2 text-center text-[10px] font-medium text-slate-700 outline-none"
                />

              </div>

              {/* GENERATE */}

              <button
                type="button"
                disabled={
                  generating ||
                  deleting ||
                  running
                }
                onClick={
                  handleGenerateEvents
                }
                className="flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating ? (
                  <Loader2
                    size={12}
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={12} />
                )}

                {generating
                  ? "Generating..."
                  : "Generate Events"}
              </button>

              {/* RUN RECOVERY */}

              <button
                type="button"
                disabled={
                  running ||
                  generating ||
                  deleting ||
                  events.length === 0
                }
                onClick={
                  handleRunRecovery
                }
                className="flex items-center justify-center gap-1.5 rounded-md bg-[#1d9d68] px-3 py-2 text-[10px] font-medium text-white transition hover:bg-[#16875a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {running ? (
                  <Loader2
                    size={12}
                    className="animate-spin"
                  />
                ) : (
                  <Play size={12} />
                )}

                {running
                  ? "Running..."
                  : "Run Recovery"}
              </button>

              {/* REFRESH */}

              <button
                type="button"
                disabled={
                  loadingEvents ||
                  deleting
                }
                onClick={
                  loadEvents
                }
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-[10px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCw
                  size={11}
                  className={
                    loadingEvents
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              {/* DELETE ALL */}

              <button
                type="button"
                disabled={
                  deleting ||
                  generating ||
                  running ||
                  events.length === 0
                }
                onClick={
                  handleDeleteAllEvents
                }
                className="flex items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2
                    size={12}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={12} />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete All Test Events"}
              </button>

            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">

            {running && (
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[8px] font-medium text-amber-600">
                Recovery pipeline running
              </span>
            )}

            <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] text-slate-500">
              {events.length} events
            </span>

            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] text-emerald-600">
              Socket.IO live updates
            </span>

          </div>

          {successMessage && (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-[9px] text-emerald-700">
                {successMessage}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-[9px] text-red-600">
                {error}
              </p>
            </div>
          )}

        </section>

        {/* SEARCH */}

        <div className="relative w-full">

          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search event, customer, email or root cause"
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-400"
          />

        </div>

        {/* FILTERS */}

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <FilterSelect
            label="Customer"
            value={
              filters.customer
            }
            options={
              customerOptions
            }
            onChange={(value) =>
              setFilters(
                (previous) => ({
                  ...previous,
                  customer: value,
                })
              )
            }
          />

          <FilterSelect
            label="Event Type"
            value={filters.type}
            options={[
              "All Types",
              "Payment Failure",
              "Checkout Abandonment",
              "Subscription Failure",
              "Overdue Invoice",
              "B2B Payment Due",
            ]}
            onChange={(value) =>
              setFilters(
                (previous) => ({
                  ...previous,
                  type: value,
                })
              )
            }
          />

          <FilterSelect
            label="Root Cause"
            value={
              filters.rootCause
            }
            options={[
              "All Causes",
              "Insufficient funds",
              "OTP timeout",
              "Card expired",
              "Issuer declined",
              "Gateway timeout",
              "Session dropped",
              "3DS failure",
              "Mandate revoked",
              "Client cash-flow hold",
              "Disputed invoice",
              "Unrecognized pattern",
            ]}
            onChange={(value) =>
              setFilters(
                (previous) => ({
                  ...previous,
                  rootCause: value,
                })
              )
            }
          />

          <FilterSelect
            label="AI Intervention"
            value={filters.action}
            options={[
              "All Actions",
              "EMAIL",
              "VOICE",
              "SMART_RETRY",
              "PAYMENT_LINK",
              "ACCOUNT_MANAGER",
            ]}
            onChange={(value) =>
              setFilters(
                (previous) => ({
                  ...previous,
                  action: value,
                })
              )
            }
          />

        </div>

        {/* EVENTS TABLE */}

        <div className="w-full min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">

          {hasEvents ? (
            <div className="w-full overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">

                    <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-wide text-slate-500">
                      Event
                    </th>

                    <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-wide text-slate-500">
                      Root Cause
                    </th>

                    <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-wide text-slate-500">
                      AI Intervention
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredEvents.map(
                    (event) => {
                      const config =
                        actionConfig[
                          event.recommendedAction
                        ];

                      const ActionIcon =
                        config?.icon;

                      const customer =
                        event.customer ||
                        {};

                      return (
                        <tr
                          key={event.id}
                          onClick={() =>
                            setSelectedEvent(
                              event
                            )
                          }
                          className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
                        >

                          <td className="px-4 py-3">
                            <p className="text-[11px] font-semibold text-slate-700">
                              {event.id}
                            </p>

                            {event.invoiceNumber && (
                              <p className="mt-0.5 text-[8px] text-slate-400">
                                {
                                  event.invoiceNumber
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <p className="text-[10px] font-semibold text-slate-700">
                              {customer.name ||
                                "Unknown Customer"}
                            </p>

                            {customer.email && (
                              <p className="mt-0.5 max-w-[180px] truncate text-[8px] text-slate-400">
                                {
                                  customer.email
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">

                              <span className="text-[10px] text-slate-600">
                                {event.type}
                              </span>

                              {(event.type ===
                                "Overdue Invoice" ||
                                event.type ===
                                  "B2B Payment Due") && (
                                <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[8px] font-semibold text-purple-600">
                                  B2B
                                </span>
                              )}

                            </div>
                          </td>

                          <td className="px-4 py-3 text-[11px] font-semibold text-slate-700">
                            ₹
                            {Number(
                              event.amount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span className="rounded bg-slate-100 px-2 py-1 text-[9px] text-slate-600">
                              {event.rootCauseLabel ||
                                event.rootCause ||
                                "Pending"}
                            </span>
                          </td>

                          <td className="px-4 py-3">

                            <div className="flex items-center gap-2">

                              {ActionIcon && (
                                <ActionIcon
                                  size={13}
                                  className="shrink-0 text-emerald-600"
                                />
                              )}

                              <div>

                                <p className="text-[10px] font-medium text-slate-600">
                                  {event.actionLabel ||
                                    event.recommendedAction ||
                                    event.action ||
                                    "Pending"}
                                </p>

                                {event.actionStatus ===
                                  "EXECUTED" && (
                                  <p className="mt-0.5 text-[8px] font-medium text-emerald-600">
                                    Action Executed
                                  </p>
                                )}

                                {event.actionStatus ===
                                  "PROCESSING" && (
                                  <p className="mt-0.5 text-[8px] font-medium text-amber-600">
                                    Processing...
                                  </p>
                                )}

                                {event.confidence !==
                                  undefined &&
                                  event.confidence !==
                                    null && (
                                    <p className="mt-0.5 text-[8px] text-purple-500">
                                      {
                                        event.confidence
                                      }
                                      %
                                      {" "}
                                      confidence
                                    </p>
                                  )}

                              </div>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Search size={17} />
              </div>

              <p className="mt-3 text-[12px] font-medium text-slate-600">
                {loadingEvents
                  ? "Loading events..."
                  : "No events found"}
              </p>

              <p className="mt-1 max-w-[300px] text-[10px] leading-5 text-slate-400">
                {loadingEvents
                  ? "Fetching revenue events from the backend."
                  : "Enter the number of events above and click Generate Events."}
              </p>

            </div>
          )}

        </div>

      </main>

      {selectedEvent && (
        <EventDrawer
          event={selectedEvent}
          onClose={() =>
            setSelectedEvent(null)
          }
          onVoiceRecovery={
            handleVoiceRecovery
          }
          onEventUpdated={
            handleEventUpdated
          }
        />
      )}

    </div>
  );
}