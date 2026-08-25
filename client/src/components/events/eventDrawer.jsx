"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  X,
  Target,
  Brain,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Phone,
  Loader2,
  Flag,
  Mail,
  RefreshCw,
  Link2,
  UserRound,
  Sparkles,
  Ban,
  CircleCheck,
  Copy,
  ExternalLink,
} from "lucide-react";

import VoiceRecoveryModal from "./voiceRecoveryModel";

import {
  getEventById,
  runEvent,
} from "../../lib/events";

const stageIcons = {
  detected: Target,
  diagnosing: Brain,
  diagnosed: Brain,
  guardrail: ShieldCheck,
  planning: Flag,
  action: Zap,
  outcome: CheckCircle2,
  voice: Phone,
};

const actionConfig = {
  EMAIL: {
    label: "Send Dunning Email",
    icon: Mail,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },

  VOICE: {
    label: "Hinglish Voice Recovery",
    icon: Phone,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },

  SMART_RETRY: {
    label: "Smart Retry",
    icon: RefreshCw,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },

  PAYMENT_LINK: {
    label: "Create Payment Link",
    icon: Link2,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },

  ACCOUNT_MANAGER: {
    label: "Escalate to Account Manager",
    icon: UserRound,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
};

export default function EventDrawer({
  event,
  onClose,
  onVoiceRecovery,
  onEventUpdated,
}) {
  const [voiceOpen, setVoiceOpen] =
    useState(false);

  const [actionExecuted, setActionExecuted] =
    useState(
      event.actionStatus ===
        "EXECUTED"
    );

  const [actionLoading, setActionLoading] =
    useState(
      event.actionStatus ===
        "PROCESSING"
    );

  const [actionError, setActionError] =
    useState("");

  const [paymentLink, setPaymentLink] =
    useState(
      event.paymentLink?.url ||
        null
    );

  const [copied, setCopied] =
    useState(false);

  /* =========================================================
     SYNC EVENT FROM PARENT
  ========================================================= */

  useEffect(() => {
    setActionExecuted(
      event.actionStatus ===
        "EXECUTED"
    );

    setActionLoading(
      event.actionStatus ===
        "PROCESSING"
    );

    setPaymentLink(
      event.paymentLink?.url ||
        null
    );

    setActionError("");
  }, [
    event.id,
    event.actionStatus,
    event.paymentLink?.url,
  ]);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const isB2B =
    event.type ===
      "Overdue Invoice" ||
    event.type ===
      "B2B Payment Due";

  const selectedAction =
    actionConfig[
      event.recommendedAction
    ] || actionConfig.EMAIL;

  const ActionIcon =
    selectedAction.icon;

  const isBlocked =
    event.guardrail?.status ===
    "BLOCKED";

  const customer =
    event.customer || {};

  /* =========================================================
     EXECUTE ACTION
  ========================================================= */

  const executeAction =
    async () => {
      if (
        actionLoading ||
        actionExecuted
      ) {
        return;
      }

      try {
        setActionLoading(true);
        setActionError("");

        /*
         * IMPORTANT:
         *
         * New backend:
         *
         * POST /api/agent/run/:eventId
         *
         * No action.
         * No merchantId.
         * No customerId.
         * No batchId.
         */

        const result =
          await runEvent(
            event.id
          );

        /*
         * Backend may return the
         * updated event.
         */

        const returnedEvent =
          result?.event ||
          result?.data ||
          null;

        /*
         * Fetch canonical backend
         * state regardless of response.
         */

        const latestEvent =
          await getEventById(
            event.id
          );

        const resolvedEvent =
          latestEvent ||
          returnedEvent;

        if (resolvedEvent) {
          setActionExecuted(
            resolvedEvent.actionStatus ===
              "EXECUTED"
          );

          setActionLoading(
            resolvedEvent.actionStatus ===
              "PROCESSING"
          );

          setPaymentLink(
            resolvedEvent.paymentLink?.url ||
              result?.paymentLink?.url ||
              null
          );

          onEventUpdated?.(
            resolvedEvent
          );
        } else {
          /*
           * Do NOT blindly mark it executed
           * unless backend confirms it.
           */

          setActionExecuted(false);
        }
      } catch (error) {
        console.error(
          "Recovery action failed:",
          error
        );

        setActionError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to execute recovery action."
        );

        setActionLoading(false);
      }
    };

  /* =========================================================
     COPY PAYMENT LINK
  ========================================================= */

  const handleCopyPaymentLink =
    async () => {
      if (!paymentLink) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          paymentLink
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1500);
      } catch {
        setActionError(
          "Unable to copy payment link."
        );
      }
    };

  const canExecute =
    !isBlocked &&
    !actionExecuted &&
    !actionLoading;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/20"
      />

      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[460px] flex-col border-l border-slate-200 bg-white shadow-xl">

        {/* HEADER */}

        <div className="flex min-h-[68px] items-center justify-between border-b border-slate-200 px-5">

          <div>
            <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
              Razorpay Revenue Event
            </p>

            <div className="mt-1 flex items-center gap-2">

              <h2 className="text-[16px] font-semibold text-slate-800">
                {event.id}
              </h2>

              {isB2B && (
                <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[8px] font-semibold text-purple-600">
                  B2B
                </span>
              )}

            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>

        </div>

        {/* CUSTOMER */}

        <section className="border-b border-slate-200 px-5 py-4">

          <div className="flex items-start justify-between gap-4">

            <div className="min-w-0">

              <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                Customer
              </p>

              <p className="mt-1 text-[12px] font-semibold text-slate-700">
                {customer.name ||
                  "Unknown Customer"}
              </p>

              {customer.email && (
                <p className="mt-0.5 truncate text-[9px] text-slate-400">
                  {customer.email}
                </p>
              )}

            </div>

            <div className="shrink-0 text-right">

              <p className="text-[8px] uppercase tracking-wide text-slate-400">
                Amount
              </p>

              <p className="mt-1 text-[15px] font-semibold text-slate-800">
                ₹
                {Number(
                  event.amount || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

          </div>

          {event.invoiceNumber && (
            <div className="mt-3">

              <p className="text-[8px] uppercase tracking-wide text-slate-400">
                Invoice
              </p>

              <p className="mt-1 font-mono text-[9px] font-medium text-slate-600">
                {event.invoiceNumber}
              </p>

            </div>
          )}

          <div className="mt-3 flex items-center gap-2">

            <span
              className={`
                rounded-full px-2 py-1 text-[9px] font-medium
                ${
                  event.status ===
                  "Recovered"
                    ? "bg-emerald-50 text-emerald-600"
                    : event.status ===
                      "In Progress"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              {event.status ||
                "Pending"}
            </span>

            {event.actionStatus ===
              "EXECUTED" && (
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-600">
                Action Executed
              </span>
            )}

            {event.actionStatus ===
              "PROCESSING" && (
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-medium text-amber-600">
                Processing
              </span>
            )}

          </div>

        </section>

        <div className="flex-1 overflow-y-auto">

          {/* AI DECISION */}

          <section className="border-b border-slate-200 px-5 py-5">

            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                <Sparkles size={14} />
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-800">
                  AI Recovery Decision
                </p>

                <p className="text-[8px] text-slate-400">
                  Intervention selected by the recovery agent
                </p>
              </div>

            </div>

            <div
              className={`
                rounded-lg border p-3
                ${selectedAction.bg}
                ${selectedAction.border}
              `}
            >

              <div className="flex items-center gap-3">

                <div
                  className={`
                    flex h-9 w-9 items-center justify-center
                    rounded-full bg-white
                    ${selectedAction.color}
                  `}
                >
                  <ActionIcon size={16} />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                    Recommended Intervention
                  </p>

                  <p
                    className={`
                      mt-0.5 text-[12px] font-semibold
                      ${selectedAction.color}
                    `}
                  >
                    {event.actionLabel ||
                      selectedAction.label}
                  </p>

                </div>

                {event.confidence !==
                  undefined &&
                  event.confidence !==
                    null && (
                    <div className="text-right">

                      <p className="text-[8px] text-slate-400">
                        Confidence
                      </p>

                      <p className="text-[13px] font-semibold text-purple-600">
                        {event.confidence}%
                      </p>

                    </div>
                  )}

              </div>

            </div>

            <div className="mt-4">

              <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                Why this action?
              </p>

              <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
                {event.actionReason ||
                  "The recovery agent selected this intervention based on event context and recovery signals."}
              </p>

            </div>

            {event.alternatives?.length >
              0 && (
              <div className="mt-4">

                <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                  Alternative interventions
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">

                  {event.alternatives.map(
                    (action) => {
                      const config =
                        actionConfig[
                          action
                        ];

                      if (!config) {
                        return null;
                      }

                      const Icon =
                        config.icon;

                      return (
                        <span
                          key={action}
                          className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[8px] text-slate-500"
                        >
                          <Icon size={10} />
                          {config.label}
                        </span>
                      );
                    }
                  )}

                </div>

              </div>
            )}

          </section>

          {/* GUARDRAIL */}

          <section className="border-b border-slate-200 px-5 py-4">

            <div className="mb-2 flex items-center gap-2">

              <ShieldCheck
                size={14}
                className="text-slate-500"
              />

              <p className="text-[10px] font-semibold text-slate-700">
                Guardrail Check
              </p>

            </div>

            <div
              className={`
                flex items-start gap-3 rounded-lg border p-3
                ${
                  isBlocked
                    ? "border-red-200 bg-red-50"
                    : "border-emerald-200 bg-emerald-50"
                }
              `}
            >

              {isBlocked ? (
                <Ban
                  size={15}
                  className="mt-0.5 text-red-500"
                />
              ) : (
                <CircleCheck
                  size={15}
                  className="mt-0.5 text-emerald-600"
                />
              )}

              <div>

                <p
                  className={`
                    text-[9px] font-semibold
                    ${
                      isBlocked
                        ? "text-red-600"
                        : "text-emerald-600"
                    }
                  `}
                >
                  {isBlocked
                    ? "Action Blocked"
                    : "Action Permitted"}
                </p>

                <p className="mt-1 text-[9px] text-slate-500">
                  {event.guardrail?.rule ||
                    "Recovery policy checks passed."}
                </p>

                {event.guardrail?.reason && (
                  <p className="mt-1 text-[9px] leading-4 text-slate-500">
                    {
                      event.guardrail
                        .reason
                    }
                  </p>
                )}

              </div>

            </div>

          </section>

          {/* TIMELINE */}

          <section className="px-5 py-5">

            <p className="mb-4 text-[9px] font-medium uppercase tracking-wide text-slate-400">
              Agent Execution Trail
            </p>

            {event.timeline?.length ? (
              <div className="relative">

                <div className="absolute bottom-3 left-[14px] top-3 w-px bg-slate-200" />

                <div className="space-y-7">

                  {event.timeline.map(
                    (step, index) => {
                      const Icon =
                        stageIcons[
                          step.stage
                        ] ||
                        Loader2;

                      const isOutcome =
                        step.stage ===
                        "outcome";

                      const isThinking =
                        step.stage ===
                          "diagnosing" ||
                        step.stage ===
                          "planning";

                      return (
                        <div
                          key={`${step.stage}-${index}`}
                          className="relative flex gap-4"
                        >

                          <div
                            className={`
                              relative z-10 flex h-7 w-7 shrink-0
                              items-center justify-center rounded-full border
                              ${
                                isOutcome
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                                  : isThinking
                                  ? "border-purple-200 bg-purple-50 text-purple-500"
                                  : "border-slate-200 bg-white text-slate-500"
                              }
                            `}
                          >
                            <Icon size={13} />
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-2">

                              <h3
                                className={`
                                  text-[11px] font-semibold
                                  ${
                                    isThinking
                                      ? "text-purple-600"
                                      : isOutcome
                                      ? "text-emerald-600"
                                      : "text-slate-700"
                                  }
                                `}
                              >
                                {step.title}
                              </h3>

                              <span className="shrink-0 text-[8px] text-slate-400">
                                {step.time}
                              </span>

                            </div>

                            <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
                              {step.description}
                            </p>

                            {step.confidence !==
                              undefined &&
                              step.confidence !==
                                null && (
                                <div className="mt-2 inline-flex rounded-full bg-purple-50 px-2 py-1 text-[8px] font-medium text-purple-600">
                                  {
                                    step.confidence
                                  }%
                                  {" "}
                                  confidence
                                </div>
                              )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>
            ) : (
              <p className="text-[10px] text-slate-400">
                No execution trail available yet.
              </p>
            )}

          </section>

          {/* EXECUTION */}

          <section className="border-t border-slate-200 px-5 py-5">

            <p className="mb-3 text-[9px] font-medium uppercase tracking-wide text-slate-400">
              Execute Recovery
            </p>

            {isBlocked ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">

                <div className="flex items-center gap-2">

                  <Ban
                    size={14}
                    className="text-red-500"
                  />

                  <p className="text-[10px] font-semibold text-red-600">
                    Autonomous action blocked
                  </p>

                </div>

                <p className="mt-1.5 text-[9px] leading-4 text-red-500">
                  {event.guardrail
                    ?.reason ||
                    "This action was blocked by recovery policy."}
                </p>

              </div>
            ) : event.actionStatus ===
              "EXECUTED" ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">

                <div className="flex items-center justify-center gap-2">

                  <CircleCheck
                    size={14}
                    className="text-emerald-600"
                  />

                  <span className="text-[10px] font-semibold text-emerald-700">
                    Action Executed
                  </span>

                </div>

              </div>
            ) : event.recommendedAction ===
              "VOICE" ? (
              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  setVoiceOpen(true)
                }
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1d9d68] px-4 py-2.5 text-[10px] font-medium text-white hover:bg-[#16875a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <Phone size={13} />
                )}

                {actionLoading
                  ? "Processing..."
                  : "Start Voice Recovery"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={!canExecute}
                  onClick={
                    executeAction
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1d9d68] px-4 py-2.5 text-[10px] font-medium text-white hover:bg-[#16875a] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {actionLoading ? (
                    <>
                      <Loader2
                        size={13}
                        className="animate-spin"
                      />

                      {event.recommendedAction ===
                      "PAYMENT_LINK"
                        ? "Creating Payment Link..."
                        : event.recommendedAction ===
                          "SMART_RETRY"
                        ? "Running Smart Retry..."
                        : "Executing..."}
                    </>
                  ) : (
                    <>
                      <ActionIcon
                        size={13}
                      />

                      Execute{" "}
                      {event.actionLabel ||
                        selectedAction.label}
                    </>
                  )}

                </button>

                {actionError && (
                  <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2">
                    <p className="text-[9px] text-red-600">
                      {actionError}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* PAYMENT LINK */}

            {event.recommendedAction ===
              "PAYMENT_LINK" &&
              actionExecuted && (
                <div className="mt-3 rounded-md border border-indigo-200 bg-indigo-50/40 p-3">

                  <div className="flex items-center gap-2">

                    <Link2
                      size={13}
                      className="text-indigo-600"
                    />

                    <p className="text-[9px] font-semibold text-indigo-700">
                      Razorpay Payment Link
                    </p>

                  </div>

                  {paymentLink ? (
                    <>
                      <p className="mt-2 break-all rounded bg-white p-2 text-[9px] text-slate-500">
                        {paymentLink}
                      </p>

                      <div className="mt-2 flex gap-2">

                        <button
                          type="button"
                          onClick={
                            handleCopyPaymentLink
                          }
                          className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[9px] text-slate-600 hover:bg-slate-50"
                        >
                          <Copy size={11} />

                          {copied
                            ? "Copied"
                            : "Copy Link"}
                        </button>

                        <a
                          href={
                            paymentLink
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1.5 text-[9px] text-white hover:bg-indigo-700"
                        >
                          <ExternalLink
                            size={11}
                          />

                          Open Link
                        </a>

                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-[9px] text-slate-400">
                      Payment link generated but URL is not available yet.
                    </p>
                  )}

                </div>
              )}

          </section>

        </div>
      </aside>

      {voiceOpen && (
        <VoiceRecoveryModal
          event={event}
          onClose={() =>
            setVoiceOpen(false)
          }
          onRecovered={() => {
            setVoiceOpen(false);

            onVoiceRecovery?.(
              event.id
            );
          }}
        />
      )}
    </>
  );
}