import React, { useEffect, useState } from 'react'
import api, { getStoredUser } from '../api'
import DataCard from '../components/DataCard'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const user = getStoredUser()

  useEffect(() => {
    async function load() {
      try {
        const now = new Date()
        const end = now.toISOString().slice(0, 10)
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)

        const [summaryRes, productRes] = await Promise.all([
          api.get(`/api/analytics/summary?start=${start}&end=${end}`),
          api.get('/api/products/low-stock')
        ])

        setSummary(summaryRes.data)
        setLowStock(productRes.data.products || [])
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [])

  const cards = summary
    ? [
        { label: 'Total sales', value: `KSh ${Number(summary.total_sales || 0).toLocaleString()}` },
        { label: 'COGS', value: `KSh ${Number(summary.cogs || 0).toLocaleString()}` },
        { label: 'Expenses', value: `KSh ${Number(summary.expenses || 0).toLocaleString()}` },
        { label: 'Net profit', value: `KSh ${Number(summary.actual_net_profit || 0).toLocaleString()}` }
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Overview</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
        </div>
        {user?.role === 'owner' && (
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            Owner access
          </div>
        )}
      </div>

      {!summary ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Loading report...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DataCard title="Total sales" value={`KSh ${Number(summary.total_sales || 0).toLocaleString()}`} tone="emerald" action="Sales" />
            <DataCard title="COGS" value={`KSh ${Number(summary.cogs || 0).toLocaleString()}`} tone="sky" action="Cost" />
            <DataCard title="Expenses" value={`KSh ${Number(summary.expenses || 0).toLocaleString()}`} tone="amber" action="Spend" />
            <DataCard title="Net profit" value={`KSh ${Number(summary.actual_net_profit || 0).toLocaleString()}`} tone="slate" action="Profit" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_32px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Operational snapshot</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">Live</span>
              </div>
              <div className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                {[
                  { label: 'Sales performance', value: Number(summary.total_sales || 0), max: 1000000 },
                  { label: 'Expense load', value: Number(summary.expenses || 0), max: 500000 },
                  { label: 'Gross margin', value: Number(summary.expected_profit || 0), max: 1000000 }
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span>{metric.label}</span>
                      <strong className="text-slate-900 dark:text-slate-100">KSh {Number(metric.value || 0).toLocaleString()}</strong>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-slate-900 via-sky-600 to-indigo-500 dark:from-sky-500 dark:via-cyan-400 dark:to-indigo-400"
                        style={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_32px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Low stock alerts</h2>
              <div className="mt-5 space-y-3">
                {lowStock.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">No low-stock items.</div>
                ) : (
                  lowStock.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-sm shadow-sm dark:border-amber-900/40 dark:bg-amber-900/20">
                      <span className="font-medium text-slate-800 dark:text-slate-100">{item.product_name}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{item.current_stock_quantity} left</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_32px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily summary</h2>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Expected profit</div>
                <div className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">KSh {Number(summary.expected_profit || 0).toLocaleString()}</div>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Deficit</div>
                <div className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">KSh {Number(summary.deficit || 0).toLocaleString()}</div>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Period</div>
                <div className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">{summary.start} → {summary.end}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
