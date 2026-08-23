import Event from "../models/Events.js";

import {
  diagnoseEvent,
} from "./agents/diagnosis.agent.js";

import {
  decideRecoveryAction,
} from "./agents/recovery.agent.js";

import {
  applyGuardrails,
} from "./guardrails.js";

import {
  executeAction,
} from "./actions/action.executor.js";

const addTimeline = (
  event,
  {
    stage,
    title,
    description,
    confidence = null,
  }
) => {
  event.timeline.push({
    stage,

    title,

    time: new Date(),

    description,

    ...(confidence !== null
      ? { confidence }
      : {}),
  });
};

export const runPipeline =
  async (eventId) => {

    // =====================================
    // STEP 1 — LOAD EVENT
    // =====================================

    const event =
      await Event.findById(eventId);

    if (!event) {
      throw new Error(
        "Event not found"
      );
    }

    // =====================================
    // STEP 2 — DIAGNOSIS AGENT
    // =====================================

    addTimeline(event, {
      stage: "diagnosing",

      title:
        "AI Diagnosis Started",

      description:
        "RecoverJS is analyzing the payment event.",
    });

    await event.save();

    const diagnosis =
      await diagnoseEvent(event);

    event.rootCause =
      diagnosis.rootCause;

    event.rootCauseLabel =
      diagnosis.rootCauseLabel;

    event.confidence =
      diagnosis.confidence;

    event.rawLlmDiagnosis =
      diagnosis.rawResponse;

    addTimeline(event, {
      stage: "diagnosed",

      title:
        `Root Cause — ${diagnosis.rootCauseLabel}`,

      description:
        diagnosis.reasoning,

      confidence:
        diagnosis.confidence,
    });

    await event.save();

    // =====================================
    // STEP 3 — RECOVERY DECISION AGENT
    // =====================================

    let decision;

    const uncertain =
      diagnosis.rootCause ===
        "other" ||
      diagnosis.confidence < 60;

    if (uncertain) {
      decision = {
        action:
          "ACCOUNT_MANAGER",

        reasoning:
          "Diagnosis confidence is too low for autonomous recovery.",

        alternatives: [],

        rawResponse: null,
      };
    } else {
      decision =
        await decideRecoveryAction(
          event,
          diagnosis
        );
    }

    event.proposedAction =
      decision.action;

    event.actionReason =
      decision.reasoning;

    event.alternatives =
      decision.alternatives;

    event.rawLlmIntervention =
      decision.rawResponse;

    // =====================================
    // STEP 4 — GUARDRAILS
    // =====================================

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

    addTimeline(event, {
      stage: "guardrail",

      title:
        guardrailResult.guardrail
          .status === "BLOCKED"
          ? "Guardrail Blocked"
          : "Guardrail Approved",

      description:
        guardrailResult.guardrail.reason,
    });

    await event.save();

    // =====================================
    // STEP 5 — EXECUTE APPROVED ACTION
    // =====================================

    const actionResult =
      await executeAction(
        guardrailResult.finalAction,
        event
      );

    event.actionStatus =
      actionResult.status;

    event.action =
      actionResult.action;

    event.actionResult =
      actionResult.message;

    // Save generated payment link
    if (
      actionResult.paymentLink
    ) {
      event.paymentLink =
        actionResult.paymentLink;
    }

    addTimeline(event, {
      stage: "action",

      title:
        "Recovery Action",

      description:
        actionResult.message,
    });

    // =====================================
    // STEP 6 — UPDATE RECOVERY STATUS
    // =====================================

    if (
      actionResult.status ===
      "EXECUTED"
    ) {
      event.status =
        "Recovery Pending";

      event.outcome =
        `${actionResult.action} executed. Waiting for recovery confirmation.`;
    }

    if (
      actionResult.status ===
      "BLOCKED"
    ) {
      event.status =
        "In Progress";

      event.outcome =
        actionResult.message;
    }

    if (
      actionResult.status ===
      "FAILED"
    ) {
      event.status =
        "In Progress";

      event.outcome =
        `Recovery action failed: ${actionResult.message}`;
    }

    // =====================================
    // STEP 7 — SAVE EVERYTHING
    // =====================================

    await event.save();

    return event;
  };