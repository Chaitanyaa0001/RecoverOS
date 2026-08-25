"use client";

import { useEffect, useState } from "react";

import {
  Phone,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const transcript = [
  {
    speaker: "Agent",
    text: "Namaste, aapka payment fail ho gaya hai.",
  },
  {
    speaker: "Agent",
    text: "Hum aapki payment recover karne mein help kar sakte hain.",
  },
  {
    speaker: "Agent",
    text: "Kya aap abhi payment complete karna chahenge?",
  },
  {
    speaker: "Customer",
    text: "Haan, main abhi payment kar deta hoon.",
  },
  {
    speaker: "Agent",
    text: "Bilkul. Main aapko ek secure payment link bhej raha hoon.",
  },
  {
    speaker: "Customer",
    text: "Payment ho gaya hai.",
  },
];

export default function VoiceRecoveryModal({
  event,
  onClose,
  onRecovered,
}) {
  const [messages, setMessages] =
    useState([]);

  const [finished, setFinished] =
    useState(false);

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      if (index >= transcript.length) {
        clearInterval(interval);
        setFinished(true);
        return;
      }

      setMessages((previous) => [
        ...previous,
        transcript[index],
      ]);

      index += 1;
    }, 1000);

    return () =>
      clearInterval(interval);
  }, []);

  const customer =
    event.customer || {};

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">

      <div className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Phone size={14} />
            </div>

            <div>

              <h2 className="text-[12px] font-semibold text-slate-800">
                Hinglish Voice Recovery
              </h2>

              <p className="text-[9px] text-slate-400">
                {event.id}
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>

        </div>

        {/* =================================================
            CUSTOMER
            ================================================= */}

        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">

          <div className="flex items-start justify-between gap-4">

            <div className="min-w-0">

              <p className="text-[8px] uppercase tracking-wide text-slate-400">
                Customer
              </p>

              <p className="mt-1 truncate text-[11px] font-semibold text-slate-700">
                {customer.name ||
                  "Unknown Customer"}
              </p>

              {customer.email && (
                <p className="mt-0.5 truncate text-[8px] text-slate-400">
                  {customer.email}
                </p>
              )}

            </div>

            <div className="shrink-0 text-right">

              <p className="text-[8px] uppercase tracking-wide text-slate-400">
                Recovery Amount
              </p>

              <p className="mt-1 text-[11px] font-semibold text-slate-800">
                ₹
                {event.amount.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            STATUS
            ================================================= */}

        <div className="flex items-center gap-2 border-b border-slate-100 bg-emerald-50/50 px-5 py-3">

          <span
            className={`h-2 w-2 rounded-full ${
              finished
                ? "bg-slate-400"
                : "animate-pulse bg-emerald-500"
            }`}
          />

          <span className="text-[9px] font-medium text-emerald-600">

            {finished
              ? "Call completed"
              : "Agent speaking..."}

          </span>

        </div>

        {/* =================================================
            TRANSCRIPT
            ================================================= */}

        <div className="h-[330px] space-y-4 overflow-y-auto p-5">

          {messages.map(
            (message, index) => (

              <div
                key={index}
                className={`flex ${
                  message.speaker ===
                  "Agent"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >

                <div
                  className={` max-w-[80%] rounded-lg px-3 py-2
                    ${
                      message.speaker ===
                      "Agent"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-emerald-50 text-emerald-700"
                    }
                  `}
                >

                  <p className="mb-1 text-[8px] font-semibold uppercase text-slate-400">
                    {message.speaker}
                  </p>

                  <p className="text-[10px] leading-5">
                    {message.text}
                  </p>

                </div>

              </div>

            )
          )}

          {!finished && (

            <div className="flex items-center gap-2 text-[9px] text-slate-400">

              <Loader2
                size={12}
                className="animate-spin"
              />

              Agent is processing...

            </div>

          )}

        </div>

        {/* =================================================
            OUTCOME
            ================================================= */}

        {finished && (

          <div className="border-t border-slate-200 p-5">

            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">

              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>

                <p className="text-[10px] font-semibold text-emerald-700">
                  Payment recovered via Voice
                </p>

                <p className="mt-1 text-[9px] leading-4 text-emerald-600">
                  Payment recovered through the
                  Hinglish voice intervention.
                </p>

              </div>

            </div>

            <button
              onClick={onRecovered}
              className="mt-3 w-full rounded-md bg-[#1d9d68] py-2.5 text-[10px] font-medium text-white transition hover:bg-[#16875a]"
            >
              Update Event Outcome
            </button>

          </div>

        )}

      </div>

    </div>
  );
}