"use client";

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Activity,
} from "lucide-react";

const slides = [
  {
    id: 1,
    eyebrow: "DETECT",
    title: "Find revenue leakage before it becomes permanent.",
    description:
      "RecoverOS continuously monitors payment activity and identifies failed payments, overdue invoices and abandoned checkouts that represent recoverable revenue.",
    icon: Activity,
    accent: "emerald",
    metric: "1,689",
    metricLabel: "events detected",
  },

  {
    id: 2,
    eyebrow: "DIAGNOSE",
    title: "Understand why the payment failed.",
    description:
      "The recovery agent analyzes transaction context, customer behavior, gateway responses and historical signals to identify the most likely root cause.",
    icon: Brain,
    accent: "purple",
    metric: "92%",
    metricLabel: "diagnosis confidence",
  },

  {
    id: 3,
    eyebrow: "GUARDRAIL",
    title: "AI acts within clearly defined boundaries.",
    description:
      "Before executing an intervention, RecoverOS checks retry limits, communication preferences, high-value approvals, quiet hours and other recovery policies.",
    icon: ShieldCheck,
    accent: "amber",
    metric: "8.4%",
    metricLabel: "actions intentionally blocked",
  },

  {
    id: 4,
    eyebrow: "RECOVER",
    title: "Choose the right intervention automatically.",
    description:
      "Depending on the situation, the agent can select smart retry, payment links, email recovery, voice recovery or human escalation.",
    icon: Zap,
    accent: "blue",
    metric: "₹1.19Cr",
    metricLabel: "revenue recovered",
  },

  {
    id: 5,
    eyebrow: "OUTCOME",
    title: "Turn failed transactions into recovered revenue.",
    description:
      "Every intervention produces a measurable outcome that feeds back into reporting and helps the recovery system improve its future decisions.",
    icon: CheckCircle2,
    accent: "emerald",
    metric: "63.9%",
    metricLabel: "recovery rate",
  },
];

const accentStyles = {
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-600",
    glow: "from-emerald-100/70",
  },

  purple: {
    icon: "bg-purple-50 text-purple-600",
    badge: "bg-purple-50 text-purple-600",
    glow: "from-purple-100/70",
  },

  amber: {
    icon: "bg-amber-50 text-amber-600",
    badge: "bg-amber-50 text-amber-600",
    glow: "from-amber-100/70",
  },

  blue: {
    icon: "bg-blue-50 text-blue-600",
    badge: "bg-blue-50 text-blue-600",
    glow: "from-blue-100/70",
  },
};

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const current = slides[activeIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((previous) =>
        previous === slides.length - 1
          ? 0
          : previous + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const goNext = () => {
    setActiveIndex((previous) =>
      previous === slides.length - 1
        ? 0
        : previous + 1
    );
  };

  const goPrevious = () => {
    setActiveIndex((previous) =>
      previous === 0
        ? slides.length - 1
        : previous - 1
    );
  };

  const Icon = current.icon;
  const styles = accentStyles[current.accent];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* BACKGROUND */}

      <div
        className={`pointer-events-none absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-gradient-to-br ${styles.glow} to-transparent blur-3xl`}
      />

      <div className="relative grid min-h-[420px] lg:grid-cols-[1.15fr_0.85fr]">

        {/* LEFT */}

        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">

          <div className="mb-5 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[8px] font-semibold tracking-[0.14em] ${styles.badge}`}
            >
              {current.eyebrow}
            </span>

            <span className="text-[9px] text-slate-400">
              AI Revenue Recovery Agent
            </span>
          </div>

          <h2 className="max-w-[600px] text-[28px] font-semibold leading-[1.12] tracking-tight text-slate-900 sm:text-[36px] lg:text-[42px]">
            {current.title}
          </h2>

          <p className="mt-5 max-w-[560px] text-[12px] leading-6 text-slate-500 sm:text-[13px]">
            {current.description}
          </p>

          {/* CONTROLS */}

          <div className="mt-8 flex items-center gap-3">

            <button
              type="button"
              onClick={goPrevious}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              aria-label="Previous slide"
            >
              <ArrowLeft size={15} />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              aria-label="Next slide"
            >
              <ArrowRight size={15} />
            </button>

            <div className="ml-2 flex items-center gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-7 bg-slate-800"
                      : "w-1.5 bg-slate-300"
                  }`}
                />
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT VISUAL */}

        <div className="relative flex items-center justify-center border-t border-slate-100 bg-slate-50/60 p-7 lg:border-l lg:border-t-0 lg:p-10">

          <div className="w-full max-w-[340px]">

            {/* AGENT CARD */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2.5">

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles.icon}`}
                  >
                    <Icon size={17} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-800">
                      Recovery Agent
                    </p>

                    <p className="text-[8px] text-slate-400">
                      Autonomous decision engine
                    </p>
                  </div>

                </div>

                <span className="flex items-center gap-1 text-[8px] font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>

              </div>

              {/* METRIC */}

              <div className="mt-7 rounded-lg border border-slate-100 bg-slate-50 p-4">

                <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  Current signal
                </p>

                <p className="mt-2 text-[30px] font-semibold tracking-tight text-slate-800">
                  {current.metric}
                </p>

                <p className="mt-1 text-[9px] text-slate-400">
                  {current.metricLabel}
                </p>

              </div>

              {/* MINI FLOW */}

              <div className="mt-5 space-y-2">

                {[
                  "Payment event detected",
                  "Context analyzed",
                  "Recovery policy checked",
                  "Intervention selected",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        index <= activeIndex
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <CheckCircle2 size={10} />
                    </div>

                    <p className="text-[9px] text-slate-500">
                      {item}
                    </p>
                  </div>
                ))}

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}