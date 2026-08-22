"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RecoveryByTypeChart({ data }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-[12px] font-semibold text-slate-800">
          Recovery Rate by Event Type
        </h2>

        <p className="mt-1 text-[10px] text-slate-400">
          Razorpay-wide recovery performance
        </p>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 0,
              right: 25,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="#e8edf1"
            />

            <XAxis
              type="number"
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748b",
              }}
              tickFormatter={(value) => `${value}%`}
            />

            <YAxis
              type="category"
              dataKey="type"
              width={125}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748b",
              }}
            />

            <Tooltip
              formatter={(value) => `${value}%`}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "11px",
              }}
            />

            <Bar
              dataKey="recovery"
              name="Recovery Rate"
              fill="#1d9d68"
              radius={[0, 3, 3, 0]}
              barSize={15}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}