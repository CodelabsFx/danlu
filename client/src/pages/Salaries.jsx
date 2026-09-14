import React, { useEffect, useState } from 'react'
import api from '../api'
import DataTable from '../components/DataTable'

export default function Salaries() {
  const [salaries, setSalaries] = useState([])
  const [workers, setWorkers] = useState([])
  const [form, setForm] = useState({ worker_id: '', month: '', basic_salary: 0, allowances: 0, deductions: 0 })

  async function loadData() {
    const [salaryRes, workerRes] = await Promise.all([
      api.get('/api/salaries'),
      api.get('/api/workers')
    ])
    setSalaries(salaryRes.data.salaries || [])
    setWorkers(workerRes.data.workers || [])
  }

  useEffect(() => {
    loadData().catch((err) => console.error(err))
  }, [])

  async function submit(e) {
    e.preventDefault()
    try {
      await api.post('/api/salaries', {
        worker_id: Number(form.worker_id),
        month: form.month,
        basic_salary: Number(form.basic_salary || 0),
        allowances: Number(form.allowances || 0),
        deductions: Number(form.deductions || 0)
      })
      setForm({ worker_id: '', month: '', basic_salary: 0, allowances: 0, deductions: 0 })
      await loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Salary failed to save')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Payroll</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Salaries</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Record salary</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Worker</label>
              <select
                value={form.worker_id}
                onChange={(e) => setForm({ ...form, worker_id: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Select worker</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>{worker.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Month</label>
              <input
                type="month"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Basic</label>
                <input type="number" value={form.basic_salary} onChange={(e) => setForm({ ...form, basic_salary: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Allow.</label>
                <input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Deductions</label>
                <input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </div>
            </div>

            <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700">Save salary</button>
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payroll history</h2>
          <div className="mt-4">
            <DataTable
              columns={[
                { key: 'month', label: 'Month' },
                { key: 'basic_salary', label: 'Basic', render: (row) => `KSh ${Number(row.basic_salary || 0).toLocaleString()}` },
                { key: 'allowances', label: 'Allowances', render: (row) => `KSh ${Number(row.allowances || 0).toLocaleString()}` },
                { key: 'deductions', label: 'Deductions', render: (row) => `KSh ${Number(row.deductions || 0).toLocaleString()}` },
                { key: 'net_salary', label: 'Net', render: (row) => `KSh ${Number(row.net_salary || 0).toLocaleString()}` }
              ]}
              rows={salaries}
              emptyText="No salary records found."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
