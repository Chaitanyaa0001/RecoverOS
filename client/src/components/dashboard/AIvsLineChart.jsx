"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AIvsBaselineChart({ data }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-[12px] font-semibold text-slate-800">
          AI Agent vs Baseline
        </h2>

        <p className="mt-1 text-[10px] text-slate-400">
          Recovery rate across Razorpay-managed revenue events
        </p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 15,
              left: 0,
              bottom: 10,
            }}
            barGap={3}
          >
            <CartesianGrid
              vertical={false}
              stroke="#e8edf1"
            />

            <XAxis
              dataKey="type"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748b",
              }}
            />

            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748b",
              }}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              formatter={(value) => `${value}%`}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "11px",
              }}
            />

            <Legend
              wrapperStyle={{
                fontSize: "10px",
              }}
            />

            <Bar
              dataKey="baseline"
              name="Rules Baseline"
              fill="#687587"
              radius={[3, 3, 0, 0]}
              barSize={30}
            />

            <Bar
              dataKey="agent"
              name="AI Agent"
              fill="#1d9d68"
              radius={[3, 3, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}