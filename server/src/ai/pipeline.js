import Event from "../models/Events.js";
import { diagnoseEvent } from "./agents/diagnosis.agent.js";
import { decideRecoveryAction } from "./agents/recovery.agent.js";
import { applyGuardrails } from "./guardralis.js";
import { executeAction } from "./actions/action.executer.js";

/* =========================================================
   PROGRESS
========================================================= */

const emitProgress = (event, onProgress, data) => {
  if (typeof onProgress !== "function") {
    return;
  }

  onProgress({
    eventId: event._id,
    ...data,
  });
};

/* =========================================================
   TIMELINE
========================================================= */

const addTimeline = (
  event,
  {
    stage,
    title,
    description,
    confidence = null,
  }
) => {
  if (!Array.isArray(event.timeline)) {
    event.timeline = [];
  }

  event.timeline.push({
    stage,
    title,
    time: new Date(),
    description:
      description ||
      "Recovery pipeline step completed.",
    ...(confidence !== null
      ? { confidence }
      : {}),
  });
};

/* =========================================================
   RUN PIPELINE
   Processes ONE event.

   IMPORTANT:
   The controller/batch worker atomically changes:

   PENDING / FAILED
          ↓
      PROCESSING

   This function does NOT claim the event again.
========================================================= */

export const runPipeline = async (
  eventId,
  onProgress = null
) => {
  /* =======================================================
     1. LOAD EVENT
  ======================================================= */

  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  /* =======================================================
     START
  ======================================================= */

  emitProgress(event, onProgress, {
    stage: "started",
    status: event.status,
    actionStatus: "PROCESSING",
    message: "Recovery pipeline started.",
  });

  /* =======================================================
     2. AI DIAGNOSIS
  ======================================================= */

  addTimeline(event, {
    stage: "diagnosing",
    title: "AI Diagnosis Started",
    description:
      "RecoverJS is analyzing the revenue-loss event.",
  });

  await event.save();

  emitProgress(event, onProgress, {
    stage: "diagnosing",
    status: event.status,
    actionStatus: "PROCESSING",
    message:
      "RecoverJS is analyzing the revenue-loss event.",
  });

  const diagnosis = await diagnoseEvent(event);

  event.rootCause = diagnosis.rootCause;
  event.rootCauseLabel =
    diagnosis.rootCauseLabel;
  event.confidence = diagnosis.confidence;
  event.rawLlmDiagnosis =
    diagnosis.rawResponse;

  addTimeline(event, {
    stage: "diagnosed",
    title:
      `Root Cause — ${diagnosis.rootCauseLabel}`,
    description: diagnosis.reasoning,
    confidence: diagnosis.confidence,
  });

  await event.save();

  emitProgress(event, onProgress, {
    stage: "diagnosed",
    status: event.status,
    actionStatus: "PROCESSING",
    rootCause: diagnosis.rootCause,
    rootCauseLabel:
      diagnosis.rootCauseLabel,
    confidence: diagnosis.confidence,
    message: diagnosis.reasoning,
  });

  /* =======================================================
     3. RECOVERY DECISION
  ======================================================= */

  const decision =
    await decideRecoveryAction(
      event,
      diagnosis
    );

  event.proposedAction = decision.action;
  event.actionReason = decision.reasoning;
  event.alternatives =
    decision.alternatives;
  event.rawLlmIntervention =
    decision.rawResponse;

  addTimeline(event, {
    stage: "planning",
    title:
      `Recovery Action Selected — ${decision.action}`,
    description: decision.reasoning,
  });

  await event.save();

  emitProgress(event, onProgress, {
    stage: "planning",
    status: event.status,
    actionStatus: "PROCESSING",
    action: decision.action,
    message: decision.reasoning,
    alternatives:
      decision.alternatives,
  });

  /* =======================================================
     4. GUARDRAILS
  ======================================================= */

  const guardrailResult =
    applyGuardrails(
      decision.action,
      event,
      diagnosis
    );

  event.guardrail =
    guardrailResult.guardrail;

  event.recommendedAction =
    guardrailResult.finalAction;

  const guardrailBlocked =
    guardrailResult.guardrail.status ===
    "BLOCKED";

  addTimeline(event, {
    stage: "guardrail",
    title: guardrailBlocked
      ? "Guardrail Blocked"
      : "Guardrail Approved",
    description:
      guardrailResult.guardrail.reason,
  });

  await event.save();

  emitProgress(event, onProgress, {
    stage: "guardrail",
    status:
      guardrailResult.guardrail.status,
    action:
      guardrailResult.finalAction,
    guardrail:
      guardrailResult.guardrail,
    message:
      guardrailResult.guardrail.reason,
  });

  /* =======================================================
     5. EXECUTE ACTION
  ======================================================= */

  let actionResult;

  if (!guardrailResult.finalAction) {
    actionResult = {
      status: "BLOCKED",
      action: null,
      message:
        guardrailResult.guardrail.reason ||
        "No recovery action was approved.",
    };
  } else {
    emitProgress(event, onProgress, {
      stage: "action",
      status: event.status,
      actionStatus: "PROCESSING",
      action:
        guardrailResult.finalAction,
      message:
        `Executing ${guardrailResult.finalAction}.`,
    });

    actionResult =
      await executeAction(
        guardrailResult.finalAction,
        event
      );
  }

  /* =======================================================
     6. STORE ACTION RESULT
  ======================================================= */

  event.actionStatus =
    actionResult.status;

  event.action =
    actionResult.action ||
    guardrailResult.finalAction ||
    null;

  event.actionResult =
    actionResult.message ||
    "Recovery action completed.";

  if (actionResult.paymentLink) {
    event.paymentLink =
      actionResult.paymentLink;
  }

  addTimeline(event, {
    stage: "action",
    title: event.action
      ? `Action — ${event.action}`
      : "Action Blocked",
    description:
      actionResult.message ||
      "Recovery action completed.",
  });

  /* =======================================================
     7. FINAL BUSINESS STATUS

     actionStatus = execution state
     status       = recovery/business state
  ======================================================= */

  switch (actionResult.status) {
    /* -----------------------------------------------------
       SUCCESS

       IMPORTANT:
       This MUST remain EXECUTED.

       Frontend will therefore hide Execute.
    ----------------------------------------------------- */

    case "EXECUTED":
      event.actionStatus = "EXECUTED";
      event.status = "Recovery Pending";

      event.outcome =
        `${event.action} executed. Waiting for recovery confirmation.`;

      break;

    /* -----------------------------------------------------
       PENDING

       Example: VOICE / ACCOUNT MANAGER
    ----------------------------------------------------- */

    case "PENDING":
      event.actionStatus = "PENDING";
      event.status = "Recovery Pending";

      event.outcome =
        actionResult.message ||
        "Recovery action is pending.";

      break;

    /* -----------------------------------------------------
       BLOCKED

       Not executable again automatically.
    ----------------------------------------------------- */

    case "BLOCKED":
      event.actionStatus = "BLOCKED";
      event.status = "Recovery Blocked";

      event.outcome =
        actionResult.message ||
        "Recovery action was blocked by guardrails.";

      break;

    /* -----------------------------------------------------
       FAILED

       FAILED is intentionally retryable.
       Therefore frontend MAY show Execute again.
    ----------------------------------------------------- */

    case "FAILED":
      event.actionStatus = "FAILED";
      event.status = "In Progress";

      event.outcome =
        `Recovery action failed: ${
          actionResult.message ||
          "Unknown error."
        }`;

      break;

    /* -----------------------------------------------------
       UNKNOWN

       Never leave an unknown state as executable.
    ----------------------------------------------------- */

    default:
      event.actionStatus = "FAILED";
      event.status = "In Progress";

      event.outcome =
        actionResult.message ||
        "Recovery action returned an unknown status.";

      break;
  }

  /* =======================================================
     8. SAVE FINAL EVENT STATE
  ======================================================= */

  await event.save();

  /* =======================================================
     9. FINAL SOCKET EVENT

     No runId.
     No room.
     Event _id identifies the event.
  ======================================================= */

  emitProgress(event, onProgress, {
    stage: "completed",
    status: event.status,
    action: event.action,
    actionStatus: event.actionStatus,
    recoveredAmount:
      event.recoveredAmount,
    paymentLink: event.paymentLink,
    outcome: event.outcome,
    message: event.actionResult,
  });

  return event;
};