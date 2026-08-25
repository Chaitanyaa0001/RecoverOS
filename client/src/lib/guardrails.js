import { getEvents } from "./events";

function deriveFinalStatus(rule = "") {
  const normalized = rule.toLowerCase();

  if (normalized.includes("quiet")) {
    return "Deferred";
  }

  if (
    normalized.includes("opt-out") ||
    normalized.includes("do-not-call")
  ) {
    return "No action";
  }

  if (
    normalized.includes("retry") ||
    normalized.includes("incentive")
  ) {
    return "Exhausted";
  }

  return "No action";
}

export async function getGuardrails() {
const { events = [] } = await getEvents();
  const guardrailEvents = events.filter(
    (event) =>
      event.guardrail?.status === "BLOCKED" ||
      event.actionStatus === "BLOCKED"
  );

  const mappedEvents = guardrailEvents.map(
    (event) => {
      const rule =
        event.guardrail?.rule || "Policy Block";

      return {
        id: event.id,
        customer: event.customer,
        rule,
        status: deriveFinalStatus(rule),
        reason:
          event.guardrail?.reason ||
          event.actionResult ||
          "Action blocked by recovery policy.",
      };
    }
  );

  return {
    summary: {
      percentage:
        events.length > 0
          ? Number(
              ((mappedEvents.length / events.length) *
                100).toFixed(1)
            )
          : 0,
      heldEvents: mappedEvents.length,
      totalEvents: events.length,
      description:
        "events in the selected period were held back by policy guardrails.",
    },
    events: mappedEvents,
  };
}
