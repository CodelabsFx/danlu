import React, { useEffect, useState } from 'react'
import api, { getStoredUser } from '../api'
import DataTable from '../components/DataTable'

const emptyForm = {
  full_name: '',
  national_id_or_passport: '',
  role_title: '',
  phone: '',
  salary_amount: 0,
  hired_date: ''
}

export default function Workers() {
  const [workers, setWorkers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const user = getStoredUser()
  const isAdmin = user?.role === 'owner'

  async function loadWorkers() {
    try {
      const res = await api.get('/api/workers')
      setWorkers(res.data.workers || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadWorkers()
  }, [])

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function handleCreate() {
    try {
      const payload = {
        ...form,
        salary_amount: Number(form.salary_amount)
      }

      if (editingId) {
        await api.put(`/api/workers/${editingId}`, payload)
      } else {
        await api.post('/api/workers', payload)
      }

      resetForm()
      await loadWorkers()
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    }
  }

  function handleEdit(worker) {
    setEditingId(worker.id)
    setForm({
      full_name: worker.full_name || '',
      national_id_or_passport: worker.national_id_or_passport || '',
      role_title: worker.role_title || '',
      phone: worker.phone || '',
      salary_amount: worker.salary_amount || 0,
      hired_date: worker.hired_date ? worker.hired_date.slice(0, 10) : ''
    })
  }

  async function handleDelete(id) {
    try {
      if (!window.confirm('Delete this worker?')) return
      await api.delete(`/api/workers/${id}`)
      await loadWorkers()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Team</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Workers</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Team roster</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {workers.length} workers
            </span>
          </div>

          <DataTable
            columns={[
              { key: 'full_name', label: 'Name', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.full_name}</span> },
              { key: 'role_title', label: 'Role' },
              { key: 'salary_amount', label: 'Salary', render: (row) => `KSh ${Number(row.salary_amount || 0).toLocaleString()}` },
              { key: 'actions', label: 'Action', render: (row) => isAdmin ? (
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(row)} className="rounded-lg bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-600">Edit</button>
                  <button onClick={() => handleDelete(row.id)} className="rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-600">Delete</button>
                </div>
              ) : <span className="text-slate-400">—</span> }
            ]}
            rows={workers}
            emptyText="No workers found."
          />
        </div>

        {isAdmin && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit worker' : 'Add worker'}</h2>
            <div className="mt-5 space-y-3">
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Full name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                value={form.role_title}
                onChange={(e) => setForm({ ...form, role_title: e.target.value })}
                placeholder="Role title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                value={form.national_id_or_passport}
                onChange={(e) => setForm({ ...form, national_id_or_passport: e.target.value })}
                placeholder="National ID / Passport"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  value={form.salary_amount}
                  onChange={(e) => setForm({ ...form, salary_amount: e.target.value })}
                  placeholder="Salary"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <input
                  type="date"
                  value={form.hired_date}
                  onChange={(e) => setForm({ ...form, hired_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
                >
                  {editingId ? 'Update worker' : 'Save worker'}
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
