import GuardrailsClient from "../../components/guardrails/guardrailsClient";
import { getGuardrails } from "../../lib/guardrails";

export default async function GuardrailsPage() {
  const guardrails = await getGuardrails();

  return (
    <div
      className="
        min-h-screen
        w-full
        min-w-0
        overflow-x-hidden
        bg-[#f8fafb]

        mt-14

        md:mt-0
        md:ml-[64px]
        md:w-[calc(100%-64px)]

        lg:ml-[250px]
        lg:w-[calc(100%-250px)]
      "
    >
      <GuardrailsClient initialGuardrails={guardrails} />
    </div>
  );
}