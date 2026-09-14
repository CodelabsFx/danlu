import React from 'react'

export default function DataCard({ title, value, tone = 'slate', subtitle, action }) {
  const toneMap = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  }

  const accentMap = {
    slate: 'from-slate-900/5 via-slate-900/0 to-transparent',
    emerald: 'from-emerald-500/10 via-emerald-500/0 to-transparent',
    amber: 'from-amber-500/10 via-amber-500/0 to-transparent',
    sky: 'from-sky-500/10 via-sky-500/0 to-transparent',
    red: 'from-red-500/10 via-red-500/0 to-transparent'
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
      <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[tone] || accentMap.slate}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</div>
          {subtitle && <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>}
        </div>
        {action && <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneMap[tone] || toneMap.slate}`}>{action}</div>}
      </div>
    </div>
  )
}
