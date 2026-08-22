"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CumulativeRecoveryChart({ data }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-[12px] font-semibold text-slate-800">
          Cumulative Revenue Recovered
        </h2>

        <p className="mt-1 text-[10px] text-slate-400">
          Total revenue recovered across all merchants
        </p>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#e8edf1"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748b",
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748b",
              }}
              tickFormatter={(value) => `₹${value}L`}
            />

            <Tooltip
              formatter={(value) => `₹${value}L`}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "11px",
              }}
            />

            <Line
              type="monotone"
              dataKey="amount"
              name="Revenue Recovered"
              stroke="#1d9d68"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}