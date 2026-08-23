import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  CreditCard,
  FileWarning,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Activity,
  Zap,
} from "lucide-react";
import Navbar from "../components/navbar";
import HeroCarousel from "../components/herocrousal";

const capabilities = [
  {
    icon: Target,
    title: "Event Detection",
    description:
      "Identify failed payments, overdue invoices and checkout abandonment as soon as revenue risk appears.",
  },
  {
    icon: Brain,
    title: "AI Diagnosis",
    description:
      "Understand the likely root cause using transaction context, customer behavior and historical signals.",
  },
  {
    icon: ShieldCheck,
    title: "Policy Guardrails",
    description:
      "Prevent unsafe actions with retry limits, communication policies, approvals and customer preferences.",
  },
  {
    icon: Zap,
    title: "Autonomous Recovery",
    description:
      "Select and execute the most suitable recovery intervention for each individual event.",
  },
];

const interventions = [
  {
    icon: RefreshCw,
    title: "Smart Retry",
    description:
      "Retry failed transactions when behavioral signals suggest the highest probability of success.",
  },
  {
    icon: Mail,
    title: "Recovery Email",
    description:
      "Send contextual payment reminders with a low-friction recovery path.",
  },
  {
    icon: CreditCard,
    title: "Payment Link",
    description:
      "Generate a direct payment path for customers who abandoned checkout.",
  },
  {
    icon: Phone,
    title: "Voice Recovery",
    description:
      "Use conversational Hinglish voice recovery when the customer is eligible.",
  },
  {
    icon: UserRound,
    title: "Human Escalation",
    description:
      "Route sensitive or high-value cases to an account manager instead of acting autonomously.",
  },
];

const flow = [
  {
    number: "01",
    title: "Detect",
    text: "A revenue event enters the system.",
  },
  {
    number: "02",
    title: "Diagnose",
    text: "The agent determines why the event happened.",
  },
  {
    number: "03",
    title: "Protect",
    text: "Guardrails decide what the agent is allowed to do.",
  },
  {
    number: "04",
    title: "Act",
    text: "The best recovery intervention is executed.",
  },
  {
    number: "05",
    title: "Learn",
    text: "The outcome becomes a signal for future decisions.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafb] text-slate-800">

      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-white pt-[68px]">

        {/* Background decoration */}

        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-50/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-16 sm:px-8 sm:pt-20 lg:px-10 lg:pb-20">

          <div className="mx-auto max-w-3xl text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-medium text-emerald-700">

              <Sparkles size={11} />

              Autonomous Revenue Recovery

            </div>

            <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-slate-900 sm:text-[54px] lg:text-[68px]">

              Turn failed payments into

              <span className="block text-[#1d9d68]">
                recovered revenue.
              </span>

            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-[13px] leading-6 text-slate-500 sm:text-[14px]">
              RecoverOS is an AI-powered revenue recovery platform that
              detects payment failures, understands why they happened,
              checks policy guardrails and chooses the right recovery
              action automatically.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

              <Link
                href="/dashboard"
                className="group flex items-center justify-center gap-2 rounded-md bg-[#1d9d68] px-5 py-3 text-[11px] font-medium text-white shadow-lg shadow-emerald-200/40 transition hover:bg-[#16875a]"
              >
                Get Started

                <ArrowRight
                  size={13}
                  className="transition group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/events"
                className="flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-3 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Explore Events

                <ArrowUpRight size={13} />
              </Link>

            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[9px] text-slate-400">

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={11}
                  className="text-emerald-500"
                />
                AI diagnosis
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={11}
                  className="text-emerald-500"
                />
                Policy guardrails
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={11}
                  className="text-emerald-500"
                />
                Autonomous actions
              </span>

            </div>

          </div>

          {/* HERO CAROUSEL */}

          <div className="mt-14 sm:mt-16">
            <HeroCarousel />
          </div>

        </div>
      </section>

      {/* =====================================================
          OVERVIEW
      ===================================================== */}

      <section className="border-b border-slate-200 bg-[#f8fafb]">

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">

          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                What is RecoverOS?
              </p>

              <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[34px]">
                An operating system for revenue recovery.
              </h2>

            </div>

            <div>

              <p className="text-[13px] leading-7 text-slate-500">
                Payment failures are not all the same. A declined card,
                an expired card, an OTP timeout and a disputed invoice
                require completely different responses.
              </p>

              <p className="mt-5 text-[13px] leading-7 text-slate-500">
                RecoverOS gives an AI recovery agent the context,
                intelligence and guardrails required to make those
                decisions at scale — while keeping sensitive cases
                under human control.
              </p>

              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Open recovery dashboard
                <ArrowRight size={12} />
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          HOW AGENT WORKS
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">

          <div className="max-w-2xl">

            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              How the agent works
            </p>

            <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-slate-900 sm:text-[38px]">
              From payment failure to recovery.
            </h2>

            <p className="mt-4 text-[12px] leading-6 text-slate-500">
              RecoverOS does not simply trigger predefined rules.
              It evaluates each event, determines the context and
              chooses an intervention while respecting your policies.
            </p>

          </div>

          {/* FLOW */}

          <div className="mt-12 grid gap-3 md:grid-cols-5">

            {flow.map((item, index) => (
              <div
                key={item.number}
                className="group relative rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
              >

                <div className="flex items-center justify-between">

                  <span className="text-[9px] font-semibold text-emerald-600">
                    {item.number}
                  </span>

                  {index !== flow.length - 1 && (
                    <ArrowRight
                      size={12}
                      className="hidden text-slate-300 md:block"
                    />
                  )}

                </div>

                <h3 className="mt-6 text-[14px] font-semibold text-slate-800">
                  {item.title}
                </h3>

                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  {item.text}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          CAPABILITIES
      ===================================================== */}

      <section className="border-b border-slate-200 bg-[#f8fafb]">

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">

          <div className="text-center">

            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Core capabilities
            </p>

            <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-slate-900 sm:text-[38px]">
              Intelligence at every stage.
            </h2>

          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {capabilities.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50"
                >

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Icon size={17} />
                  </div>

                  <h3 className="mt-6 text-[13px] font-semibold text-slate-800">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-[10px] leading-5 text-slate-500">
                    {item.description}
                  </p>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* =====================================================
          INTERVENTIONS
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Recovery actions
              </p>

              <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-slate-900 sm:text-[38px]">
                One agent.
                <br />
                Multiple recovery paths.
              </h2>

              <p className="mt-5 max-w-md text-[12px] leading-6 text-slate-500">
                The agent does not force every customer through the
                same recovery journey. It selects the intervention
                that best fits the event and customer context.
              </p>

              <Link
                href="/events"
                className="mt-7 inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
              >
                View recovery events
                <ArrowRight size={12} />
              </Link>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              {interventions.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-xl border border-slate-200 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/20"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                      <Icon size={16} />
                    </div>

                    <div>
                      <h3 className="text-[11px] font-semibold text-slate-800">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 text-[9px] leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          GUARDRAILS
      ===================================================== */}

      <section className="border-b border-slate-200 bg-slate-900 text-white">

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">

          <div className="grid items-center gap-10 lg:grid-cols-2">

            <div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-emerald-400">
                <ShieldCheck size={19} />
              </div>

              <h2 className="mt-6 text-[30px] font-semibold tracking-tight sm:text-[38px]">
                Autonomous doesn't mean uncontrolled.
              </h2>

              <p className="mt-5 max-w-xl text-[12px] leading-6 text-slate-400">
                Every recovery action passes through policy checks.
                High-value invoices, customer opt-outs, retry limits
                and communication restrictions can stop the agent
                before an action is executed.
              </p>

              <Link
                href="/guardrails"
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-[10px] font-medium text-slate-800 transition hover:bg-slate-100"
              >
                Explore Guardrails
                <ArrowUpRight size={12} />
              </Link>

            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">

              <div className="space-y-4">

                {[
                  "High-value approval",
                  "Customer communication frequency",
                  "Do-not-call registry",
                  "Payment retry limits",
                  "Quiet hours",
                ].map((rule) => (
                  <div
                    key={rule}
                    className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0"
                  >

                    <span className="text-[10px] text-slate-300">
                      {rule}
                    </span>

                    <span className="flex items-center gap-1.5 text-[8px] font-medium text-emerald-400">
                      <CheckCircle2 size={11} />
                      Enforced
                    </span>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="bg-[#f8fafb]">

        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8">

          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Zap size={19} />
          </div>

          <h2 className="mt-6 text-[30px] font-semibold tracking-tight text-slate-900 sm:text-[42px]">
            Ready to recover more revenue?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[12px] leading-6 text-slate-500">
            Explore your recovery events, inspect agent decisions,
            review guardrails and track recovered revenue from one
            operating system.
          </p>

          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#1d9d68] px-5 py-3 text-[10px] font-medium text-white shadow-lg shadow-emerald-200/40 transition hover:bg-[#16875a]"
          >
            Get Started with RecoverOS
            <ArrowRight size={13} />
          </Link>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">

          <div className="flex flex-col justify-between gap-8 md:flex-row">

            <div>

              <Link
                href="/"
                className="flex items-center gap-2"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1d9d68] text-white">
                  <Activity size={15} />
                </div>

                <span className="text-[13px] font-semibold text-slate-800">
                  RecoverOS
                </span>

              </Link>

              <p className="mt-3 max-w-xs text-[9px] leading-5 text-slate-400">
                AI-powered revenue recovery infrastructure for
                modern payment operations.
              </p>

            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-5">

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Product
                </p>

                <div className="mt-3 space-y-2">
                  <Link
                    href="/dashboard"
                    className="block text-[9px] text-slate-500 hover:text-slate-800"
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/events"
                    className="block text-[9px] text-slate-500 hover:text-slate-800"
                  >
                    Events
                  </Link>

                  <Link
                    href="/guardrails"
                    className="block text-[9px] text-slate-500 hover:text-slate-800"
                  >
                    Guardrails
                  </Link>

                  <Link
                    href="/reports"
                    className="block text-[9px] text-slate-500 hover:text-slate-800"
                  >
                    Reports
                  </Link>
                </div>

              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Platform
                </p>

                <div className="mt-3 space-y-2">
                  <span className="block text-[9px] text-slate-500">
                    AI Recovery Agent
                  </span>

                  <span className="block text-[9px] text-slate-500">
                    Guardrails
                  </span>

                  <span className="block text-[9px] text-slate-500">
                    Recovery Analytics
                  </span>
                </div>

              </div>

            </div>

          </div>

          <div className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-100 pt-5 sm:flex-row">

            <p className="text-[8px] text-slate-400">
              © 2026 RecoverOS. Revenue Recovery Platform.
            </p>

            <p className="text-[8px] text-slate-400">
              Built for intelligent payment recovery.
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}