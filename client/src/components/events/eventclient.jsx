"use client";

import { useMemo, useState } from "react";

import {
  Search,
  Mail,
  Phone,
  RefreshCw,
  Link2,
  UserRound,
} from "lucide-react";

import FilterSelect from "./filterSelect";
import EventDrawer from "./eventDrawer";

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
    icon: RefreshCw,
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
  const [events, setEvents] = useState(initialEvents);

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    customer: "All Customers",
    type: "All Types",
    rootCause: "All Causes",
    action: "All Actions",
  });

  /*
   * =========================================================
   * CUSTOMER OPTIONS
   * =========================================================
   */

  const customerOptions = useMemo(() => {
    const customers = events
      .map((event) => event.customer?.name)
      .filter(Boolean);

    return [
      "All Customers",
      ...new Set(customers),
    ];
  }, [events]);

  /*
   * =========================================================
   * FILTER EVENTS
   * =========================================================
   */

  const filteredEvents = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return events.filter((event) => {
      const customerName =
        event.customer?.name
          ?.toLowerCase() || "";

      const customerEmail =
        event.customer?.email
          ?.toLowerCase() || "";

      const rootCause =
        event.rootCauseLabel
          ?.toLowerCase() || "";

      const eventId =
        event.id?.toLowerCase() || "";

      const eventType =
        event.type?.toLowerCase() || "";

      const invoiceNumber =
        event.invoiceNumber
          ?.toLowerCase() || "";

      /*
       * Search only customer/event-related information.
       * Merchant is intentionally not exposed in this UI.
       */

      const matchesSearch =
        !searchValue ||
        eventId.includes(searchValue) ||
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue) ||
        rootCause.includes(searchValue) ||
        eventType.includes(searchValue) ||
        invoiceNumber.includes(searchValue);

      /*
       * Customer filter
       */

      const matchesCustomer =
        filters.customer ===
          "All Customers" ||
        event.customer?.name ===
          filters.customer;

      /*
       * Event type filter
       */

      const matchesType =
        filters.type === "All Types" ||
        event.type === filters.type;

      /*
       * Root cause filter
       */

      const matchesRootCause =
        filters.rootCause ===
          "All Causes" ||
        event.rootCauseLabel ===
          filters.rootCause;

      /*
       * AI intervention filter
       */

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
    });
  }, [events, search, filters]);

  /*
   * =========================================================
   * VOICE RECOVERY
   * =========================================================
   */

  const handleVoiceRecovery = (eventId) => {
    const now = new Date().toISOString();

    const displayTime =
      new Date().toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    const updatedEvents = events.map(
      (event) => {
        if (event.id !== eventId) {
          return event;
        }

        return {
          ...event,

          status: "Recovered",

          outcome:
            "Recovered via Hinglish Voice",

          action:
            "Hinglish voice recovery completed",

          recommendedAction: "VOICE",

          actionLabel:
            "Hinglish Voice Recovery",

          actionStatus: "EXECUTED",

          actionResult:
            "Payment recovered via Hinglish Voice.",

          resolvedAt: now,

          timeline: [
            ...(event.timeline || []),

            {
              stage: "voice",
              title: "Voice Recovery",
              time: displayTime,
              description:
                "Hinglish voice recovery call completed.",
            },

            {
              stage: "outcome",
              title: "Outcome",
              time: displayTime,
              description:
                "Payment recovered via Hinglish Voice.",
            },
          ],
        };
      }
    );

    setEvents(updatedEvents);

    setSelectedEvent((current) => {
      if (
        !current ||
        current.id !== eventId
      ) {
        return current;
      }

      return updatedEvents.find(
        (event) =>
          event.id === eventId
      );
    });
  };

  const hasEvents =
    filteredEvents.length > 0;

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f8fafb]">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="flex min-h-[58px] w-full min-w-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-5">

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

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <main className="w-full min-w-0 space-y-4 p-3 sm:p-4 lg:p-5">

        {/* ===================================================
            SEARCH
            =================================================== */}

        <div className="relative w-full">

          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search event, customer, email or root cause"
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-400"
          />

        </div>

        {/* ===================================================
            FILTERS
            =================================================== */}

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* CUSTOMER */}

          <FilterSelect
            label="Customer"
            value={filters.customer}
            options={customerOptions}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                customer: value,
              }))
            }
          />

          {/* EVENT TYPE */}

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
              setFilters((prev) => ({
                ...prev,
                type: value,
              }))
            }
          />

          {/* ROOT CAUSE */}

          <FilterSelect
            label="Root Cause"
            value={filters.rootCause}
            options={[
              "All Causes",
              "Insufficient funds",
              "OTP timeout",
              "Card expired",
              "Issuer declined",
              "Client cash-flow hold",
              "Disputed invoice",
            ]}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                rootCause: value,
              }))
            }
          />

          {/* AI INTERVENTION */}

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
              setFilters((prev) => ({
                ...prev,
                action: value,
              }))
            }
          />

        </div>

        {/* ===================================================
            TABLE
            =================================================== */}

        <div className="w-full min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">

          {hasEvents ? (

            <div className="w-full overflow-x-auto">

              <table className="w-full min-w-[850px]">

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
                        event.customer || {};

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

                          {/* EVENT */}

                          <td className="px-4 py-3">

                            <p className="text-[11px] font-semibold text-slate-700">
                              {event.id}
                            </p>

                            {event.invoiceNumber && (
                              <p className="mt-0.5 text-[8px] text-slate-400">
                                {event.invoiceNumber}
                              </p>
                            )}

                          </td>

                          {/* CUSTOMER */}

                          <td className="px-4 py-3">

                            <p className="text-[10px] font-semibold text-slate-700">
                              {customer.name ||
                                "Unknown Customer"}
                            </p>

                            {customer.email && (
                              <p className="mt-0.5 max-w-[180px] truncate text-[8px] text-slate-400">
                                {customer.email}
                              </p>
                            )}

                          </td>

                          {/* TYPE */}

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

                          {/* AMOUNT */}

                          <td className="px-4 py-3 text-[11px] font-semibold text-slate-700">
                            ₹
                            {event.amount.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          {/* ROOT CAUSE */}

                          <td className="px-4 py-3">

                            <span className="rounded bg-slate-100 px-2 py-1 text-[9px] text-slate-600">
                              {event.rootCauseLabel}
                            </span>

                          </td>

                          {/* AI INTERVENTION */}

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
                                    event.action}
                                </p>

                                {event.confidence && (
                                  <p className="mt-0.5 text-[8px] text-purple-500">
                                    {event.confidence}%
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
                No events found
              </p>

              <p className="mt-1 max-w-[300px] text-[10px] leading-5 text-slate-400">
                No recovery events match the current filters.
                Events will appear here once the AI recovery agent detects them.
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
        />
      )}

    </div>
  );
}