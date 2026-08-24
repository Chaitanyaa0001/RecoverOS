import Event from "../models/Events.js";

import {
  diagnoseEvent,
} from "./agents/diagnosis.agent.js";

import {
  decideRecoveryAction,
} from "./agents/recovery.agent.js";

import {
  applyGuardrails,
} from "./guardralis.js";

import {
  executeAction,
} from "./actions/action.executer.js";


/*
 * =====================================
 * SOCKET PROGRESS HELPER
 * =====================================
 */

const emitProgress = (event,onProgress,data) => {
  if (typeof onProgress !== "function") {
    return;
  }
  onProgress({
    eventId: event._id,
    batchId: event.batchId,
    ...data,
  });
};


/*
 * =====================================
 * TIMELINE HELPER
 * =====================================
 */

const addTimeline = (event,{stage,title,description,confidence = null,}) => {
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

/*
 * =====================================
 * MAIN PIPELINE
 * =====================================
 */
export const runPipeline = async (eventId,onProgress = null) => {

  // =====================================
  // 1. LOAD EVENT
  // =====================================

  const event =await Event.findById(eventId);
  if (!event) {
    throw new Error(
      "Event not found"
    );
  }
  /*
   * =====================================
   * EVENT STARTED
   * =====================================
   */
  emitProgress(event,onProgress,
    {
      stage: "started",
      status: "PROCESSING",
      message:
        "Recovery pipeline started.",
    }
  );
  // =====================================
  // 2. DIAGNOSIS AGENT
  // =====================================

  addTimeline(event, {
    stage: "diagnosing",
    title:
      "AI Diagnosis Started",
    description:
      "RecoverJS is analyzing the revenue-loss event.",
  });
  await event.save();
  /*
   * LIVE UPDATE
   */
  emitProgress(event,onProgress,
    {
      stage: "diagnosing",
      status: "PROCESSING",
      message:
        "RecoverJS is analyzing the revenue-loss event.",
    }
  );
  const diagnosis = await diagnoseEvent(event);
  event.rootCause = diagnosis.rootCause;

  event.rootCauseLabel = diagnosis.rootCauseLabel;
  event.confidence = diagnosis.confidence;
  event.rawLlmDiagnosis =diagnosis.rawResponse;

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

  /*
   * LIVE UPDATE
   */

  emitProgress(event,onProgress,
    {
      stage: "diagnosed",
      status: "PROCESSING",
      rootCause:
        diagnosis.rootCause,
      rootCauseLabel:
        diagnosis.rootCauseLabel,
      confidence:
        diagnosis.confidence,
      message:
        diagnosis.reasoning,
    }
  );
  // =====================================
  // 3. RECOVERY DECISION AGENT
  // =====================================
  let decision;
  const uncertain = diagnosis.rootCause === "other" || diagnosis.confidence < 60;
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
  event.proposedAction = decision.action;
  event.actionReason = decision.reasoning;
  event.alternatives = decision.alternatives;
  event.rawLlmIntervention = decision.rawResponse;
  // =====================================
  // PLANNING TIMELINE
  // =====================================
  addTimeline(event, {stage: "planning",
    title:
      `Recovery Action Selected — ${decision.action}`,
    description:
      decision.reasoning,
  });
  await event.save();
  /*
   * LIVE UPDATE
   */

  emitProgress(event,onProgress,
    {
      stage: "planning",
      status: "PROCESSING",
      action:
        decision.action,

      message:
        decision.reasoning,
      alternatives:
        decision.alternatives,
    }
  );
  // =====================================
  // 4. GUARDRAILS
  // =====================================
  const guardrailResult =
    applyGuardrails(
      decision.action,
      event,
      diagnosis
    );
  event.guardrail = guardrailResult.guardrail;
  event.recommendedAction = guardrailResult.finalAction;
  const guardrailBlocked = guardrailResult.guardrail.status === "BLOCKED";
  addTimeline(event, {
    stage: "guardrail",
    title:
      guardrailBlocked ? "Guardrail Blocked" : "Guardrail Approved",
    description:
      guardrailResult.guardrail.reason,
  });
  await event.save();
  /*
   * LIVE UPDATE
   */
  emitProgress(event,onProgress,{
      stage: "guardrail",
      status: guardrailResult.guardrail.status,
      action: guardrailResult.finalAction,
      guardrail: guardrailResult.guardrail,
      message: guardrailResult.guardrail.reason,
    }
  );
  // =====================================
  // 5. EXECUTE APPROVED ACTION
  // =====================================

  let actionResult;
  /*
   * If there is no executable action,
   * keep the event blocked.
   */

  if (!guardrailResult.finalAction) {
      actionResult = {
      status: "BLOCKED",
      action: null,
      message: guardrailResult.guardrail.reason || "No recovery action was approved.",
    };
  } else {
    /*
     * LIVE UPDATE
     */
    emitProgress( event,onProgress,
      {
        stage: "action",
        status: "PROCESSING",
        action: guardrailResult.finalAction,
        message: `Executing ${guardrailResult.finalAction}.`,
      }
    );
    actionResult = await executeAction( guardrailResult.finalAction,event);
  }

  // =====================================
  // 6. SAVE ACTION RESULT
  // =====================================
  event.actionStatus =actionResult.status;
  event.action = actionResult.action;
  event.actionResult = actionResult.message;


  // =====================================
  // SAVE RAZORPAY PAYMENT LINK
  // =====================================

  if (
    actionResult.paymentLink
  ) {
    event.paymentLink =
      actionResult.paymentLink;
  }


  addTimeline(event, {
    stage: "action",

    title:
      actionResult.action
        ? `Action — ${actionResult.action}`
        : "Action Blocked",

    description:
      actionResult.message ||
      "Recovery action completed.",
  });


  // =====================================
  // 7. UPDATE RECOVERY STATUS
  // =====================================

  switch (
    actionResult.status
  ) {

    case "EXECUTED":

      event.status =
        "Recovery Pending";

      event.outcome =
        `${actionResult.action} executed. Waiting for recovery confirmation.`;

      break;


    case "PENDING":

      event.status =
        "Recovery Pending";

      event.outcome =
        actionResult.message;

      break;


    case "BLOCKED":

      event.status =
        "In Progress";

      event.outcome =
        actionResult.message;

      break;


    case "FAILED":

      event.status =
        "In Progress";

      event.outcome =
        `Recovery action failed: ${actionResult.message}`;

      break;


    default:

      event.status =
        "In Progress";

      event.outcome =
        actionResult.message ||
        "Recovery action completed.";
  }


  // =====================================
  // 8. SAVE EVERYTHING
  // =====================================

  await event.save();


  /*
   * =====================================
   * FINAL LIVE UPDATE
   * =====================================
   */

  emitProgress(
    event,
    onProgress,
    {
      stage: "completed",

      status:
        event.status,

      action:
        event.action,

      actionStatus:
        event.actionStatus,

      recoveredAmount:
        event.recoveredAmount,

      paymentLink:
        event.paymentLink,

      outcome:
        event.outcome,

      message:
        event.actionResult,
    }
  );


  return event;
};