"use client";

export default function MerchantPerformance({ data }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      {/* HEADER */}

      <div className="mb-4">
        <h2 className="text-[12px] font-semibold text-slate-800">
          Merchant Recovery Performance
        </h2>

        <p className="mt-1 text-[10px] text-slate-400">
          Revenue recovery across connected Razorpay merchants
        </p>
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-3 text-left text-[9px] font-medium uppercase tracking-wide text-slate-400">
                Merchant
              </th>

              <th className="pb-3 text-right text-[9px] font-medium uppercase tracking-wide text-slate-400">
                Revenue At Risk
              </th>

              <th className="pb-3 text-right text-[9px] font-medium uppercase tracking-wide text-slate-400">
                Recovered
              </th>

              <th className="pb-3 text-right text-[9px] font-medium uppercase tracking-wide text-slate-400">
                Recovery Rate
              </th>

              <th className="pb-3 text-right text-[9px] font-medium uppercase tracking-wide text-slate-400">
                Events
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((merchant) => (
              <tr
                key={merchant.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-3">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-700">
                      {merchant.name}
                    </p>

                    <p className="mt-0.5 text-[8px] text-slate-400">
                      {merchant.id}
                    </p>
                  </div>
                </td>

                <td className="py-3 text-right text-[10px] font-medium text-slate-600">
                  ₹{merchant.atRisk}L
                </td>

                <td className="py-3 text-right text-[10px] font-semibold text-emerald-600">
                  ₹{merchant.recovered}L
                </td>

                <td className="py-3 text-right">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-600">
                    {merchant.recoveryRate}%
                  </span>
                </td>

                <td className="py-3 text-right text-[10px] text-slate-500">
                  {merchant.events}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}