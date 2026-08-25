"use client";

import { useMemo, useState } from "react";

import {
  ShieldCheck,
  ChevronDown,
  Search,
} from "lucide-react";

export default function GuardrailsClient({
  initialGuardrails,
}) {
  const [period, setPeriod] =
    useState("Last 30 days");

  const [search, setSearch] =
    useState("");

  const guardrails =
    initialGuardrails || {
      summary: {},
      events: [],
    };

  // =====================================================
  // FILTER GUARDRAIL EVENTS
  // =====================================================

  const filteredEvents = useMemo(() => {
    const value =
      search.toLowerCase().trim();

    if (!value) {
      return guardrails.events || [];
    }

    return (
      guardrails.events || []
    ).filter((event) => {
      const eventId =
        event.id?.toLowerCase() || "";

      const customer =
        event.customer?.name
          ?.toLowerCase() || "";

      const rule =
        event.rule?.toLowerCase() || "";

      const status =
        event.status?.toLowerCase() || "";

      return (
        eventId.includes(value) ||
        customer.includes(value) ||
        rule.includes(value) ||
        status.includes(value)
      );
    });
  }, [
    guardrails.events,
    search,
  ]);

  const summary =
    guardrails.summary || {};

  return (
    <div className="min-h-screen w-full bg-[#f8fafb]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          flex
          min-h-[78px]
          w-full
          items-center
          justify-between
          gap-4
          border-b
          border-slate-200
          bg-white
          px-5
          sm:px-6
          lg:px-7
        "
      >

        {/* TITLE */}

        <div className="min-w-0">

          <h1 className="text-[16px] font-semibold text-slate-800">
            Guardrails
          </h1>

          <p className="mt-1 text-[10px] text-slate-500">
            Policy limits that stop the agent from over-contacting customers
          </p>

        </div>

        {/* HEADER ACTIONS */}

        <div className="flex shrink-0 items-center gap-2">

          {/* PERIOD */}

          <div className="relative">

            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value)
              }
              className="
                h-9
                appearance-none
                rounded-md
                border
                border-slate-200
                bg-white
                pl-3
                pr-8
                text-[10px]
                font-medium
                text-slate-600
                outline-none
                focus:border-emerald-400
              "
            >
              <option>
                Last 7 days
              </option>

              <option>
                Last 30 days
              </option>

              <option>
                Last 90 days
              </option>
            </select>

            <ChevronDown
              size={12}
              className="
                pointer-events-none
                absolute
                right-2.5
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

          </div>

          {/* LIVE */}

          <div
            className="
              flex
              items-center
              gap-1.5
              rounded-full
              bg-emerald-50
              px-2.5
              py-1.5
              text-[9px]
              font-medium
              text-emerald-600
            "
          >

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            Live

          </div>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main
        className="
          w-full
          space-y-5
          p-4
          sm:p-5
          lg:p-7
        "
      >

        {/* ===================================================
            SUMMARY CARD
        =================================================== */}

        <section
          className="
            flex
            items-start
            gap-3
            rounded-lg
            border
            border-emerald-200
            bg-emerald-50
            px-4
            py-4
            sm:px-5
            sm:py-4
          "
        >

          {/* ICON */}

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-md
              bg-emerald-100
              text-emerald-600
            "
          >
            <ShieldCheck size={17} />
          </div>

          {/* CONTENT */}

          <div className="min-w-0">

            <p className="text-[11px] font-semibold text-slate-700">

              {summary.percentage ?? 0}%
              {" "}
              of events were deliberately not acted on —
              {" "}
              <span className="text-emerald-700">
                guardrails working as designed
              </span>

            </p>

            <p className="mt-1 text-[9px] leading-5 text-slate-500">

              {(
                summary.heldEvents || 0
              ).toLocaleString("en-IN")}

              {" "}
              of{" "}

              {(
                summary.totalEvents || 0
              ).toLocaleString("en-IN")}

              {" "}
              events in the selected period were held back by
              opt-outs, quiet hours or incentive limits.

            </p>

          </div>

        </section>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="relative w-full">

          <Search
            size={14}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search event, customer or guardrail rule"
            className="
              h-10
              w-full
              rounded-md
              border
              border-slate-200
              bg-white
              pl-9
              pr-3
              text-[10px]
              text-slate-700
              outline-none
              placeholder:text-slate-400
              focus:border-emerald-400
            "
          />

        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <section
          className="
            w-full
            overflow-hidden
            rounded-lg
            border
            border-slate-200
            bg-white
          "
        >

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[700px]">

              {/* TABLE HEADER */}

              <thead>

                <tr
                  className="
                    border-b
                    border-slate-200
                    bg-slate-50/70
                  "
                >

                  <th
                    className="
                      px-4
                      py-3
                      text-left
                      text-[8px]
                      font-medium
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Event ID
                  </th>

                  <th
                    className="
                      px-4
                      py-3
                      text-left
                      text-[8px]
                      font-medium
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Rule Triggered
                  </th>

                  <th
                    className="
                      px-4
                      py-3
                      text-left
                      text-[8px]
                      font-medium
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Final Status
                  </th>

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody>

                {filteredEvents.map(
                  (event) => (
                    <tr
                      key={event.id}
                      className="
                        border-b
                        border-slate-100
                        transition-colors
                        hover:bg-slate-50
                      "
                    >

                      {/* EVENT */}

                      <td className="px-4 py-3">

                        <p
                          className="
                            text-[11px]
                            font-medium
                            text-slate-700
                          "
                        >
                          {event.id}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[8px]
                            text-slate-400
                          "
                        >
                          {event.customer?.name ||
                            "Unknown customer"}
                        </p>

                      </td>

                      {/* RULE */}

                      <td className="px-4 py-3">

                        <p
                          className="
                            text-[10px]
                            text-slate-500
                          "
                        >
                          {event.rule ||
                            "Policy restriction"}
                        </p>

                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-3">

                        <StatusBadge
                          status={event.status}
                        />

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* EMPTY */}

          {filteredEvents.length === 0 && (

            <div
              className="
                flex
                min-h-[250px]
                flex-col
                items-center
                justify-center
                px-5
                text-center
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-slate-400
                "
              >
                <Search size={16} />
              </div>

              <p
                className="
                  mt-3
                  text-[11px]
                  font-medium
                  text-slate-600
                "
              >
                No guardrail events found
              </p>

              <p
                className="
                  mt-1
                  text-[9px]
                  text-slate-400
                "
              >
                Try changing your search.
              </p>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}) {
  if (status === "Deferred") {
    return (
      <span
        className="
          inline-flex
          items-center
          rounded-full
          bg-amber-100
          px-2
          py-1
          text-[8px]
          font-medium
          text-amber-700
        "
      >
        {status}
      </span>
    );
  }

  if (status === "Blocked") {
    return (
      <span
        className="
          inline-flex
          items-center
          rounded-full
          bg-red-100
          px-2
          py-1
          text-[8px]
          font-medium
          text-red-700
        "
      >
        {status}
      </span>
    );
  }

  if (status === "No action") {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1
          rounded-full
          bg-slate-100
          px-2
          py-1
          text-[8px]
          font-medium
          text-slate-500
        "
      >
        {status}
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        items-center
        gap-1
        rounded-full
        bg-slate-100
        px-2
        py-1
        text-[8px]
        font-medium
        text-slate-500
      "
    >
      {status || "No action"}
    </span>
  );
}