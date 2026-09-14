import React, { useState } from 'react'
import { downloadReport } from '../api'

export default function Reports() {
  const [type, setType] = useState('pnl')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    try {
      setLoading(true)
      const blob = await downloadReport(type, start || undefined, end || undefined)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      a.href = url
      const s = start || 'all'
      const e = end || new Date().toISOString().slice(0,10)
      a.download = `report-${type}-${s}-${e}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Reports</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Export financial reports</h1>
      </div>

      <div className="card p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border p-2">
            <option value="pnl">Profit & Loss (P&L)</option>
            <option value="balance">Balance sheet (simple)</option>
          </select>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl border p-2" />
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl border p-2" />
        </div>

        <div className="mt-4">
          <button onClick={handleDownload} className="btn btn-primary" disabled={loading}>{loading ? 'Preparing…' : 'Download XLSX'}</button>
        </div>
      </div>
    </div>
  )
}
