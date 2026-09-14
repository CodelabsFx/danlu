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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Overview</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        </div>
        {user?.role === 'owner' && (
          <div className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Owner access
          </div>
        )}
      </div>

      {!summary ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Loading report...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DataCard title="Total sales" value={`KSh ${Number(summary.total_sales || 0).toLocaleString()}`} tone="emerald" action="Sales" />
            <DataCard title="COGS" value={`KSh ${Number(summary.cogs || 0).toLocaleString()}`} tone="sky" action="Cost" />
            <DataCard title="Expenses" value={`KSh ${Number(summary.expenses || 0).toLocaleString()}`} tone="amber" action="Spend" />
            <DataCard title="Net profit" value={`KSh ${Number(summary.actual_net_profit || 0).toLocaleString()}`} tone="slate" action="Profit" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Operational snapshot</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-600">
                {[
                  { label: 'Sales performance', value: Number(summary.total_sales || 0), max: 1000000 },
                  { label: 'Expense load', value: Number(summary.expenses || 0), max: 500000 },
                  { label: 'Gross margin', value: Number(summary.expected_profit || 0), max: 1000000 }
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span>{metric.label}</span>
                      <strong className="text-slate-900 dark:text-slate-100">KSh {Number(metric.value || 0).toLocaleString()}</strong>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-slate-900 to-sky-600 dark:from-sky-500 dark:to-cyan-400"
                        style={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Low stock alerts</h2>
              <div className="mt-5 space-y-3">
                {lowStock.length === 0 ? (
                  <div className="text-sm text-slate-500">No low-stock items.</div>
                ) : (
                  lowStock.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-sm dark:bg-amber-900/20">
                      <span className="font-medium text-slate-800 dark:text-slate-100">{item.product_name}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{item.current_stock_quantity} left</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily summary</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                <span>Expected profit</span>
                <strong className="text-slate-900 dark:text-slate-100">KSh {Number(summary.expected_profit || 0).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                <span>Deficit</span>
                <strong className="text-slate-900 dark:text-slate-100">KSh {Number(summary.deficit || 0).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                <span>Period</span>
                <strong className="text-slate-900 dark:text-slate-100">{summary.start} → {summary.end}</strong>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
