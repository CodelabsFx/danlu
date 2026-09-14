import React, { useEffect, useState } from 'react'
import api, { getStoredUser } from '../api'
import DataTable from '../components/DataTable'

const emptyForm = {
  expense_type: '',
  amount: 0,
  description: '',
  date: new Date().toISOString().slice(0, 10)
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const user = getStoredUser()
  const isAdmin = user?.role === 'owner'

  async function loadExpenses() {
    try {
      const res = await api.get('/api/expenses')
      setExpenses(res.data.expenses || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function handleCreate() {
    try {
      const payload = {
        ...form,
        amount: Number(form.amount)
      }

      if (editingId) {
        await api.put(`/api/expenses/${editingId}`, payload)
      } else {
        await api.post('/api/expenses', payload)
      }

      resetForm()
      await loadExpenses()
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    }
  }

  function handleEdit(expense) {
    setEditingId(expense.id)
    setForm({
      expense_type: expense.expense_type || '',
      amount: expense.amount || 0,
      description: expense.description || '',
      date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    })
  }

  async function handleDelete(id) {
    try {
      if (!window.confirm('Delete this expense?')) return
      await api.delete(`/api/expenses/${id}`)
      await loadExpenses()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Finance</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Expenses</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Expense log</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {expenses.length} entries
            </span>
          </div>

          <DataTable
            columns={[
              { key: 'expense_type', label: 'Type', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.expense_type}</span> },
              { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
              { key: 'amount', label: 'Amount', render: (row) => `KSh ${Number(row.amount || 0).toLocaleString()}` },
              { key: 'actions', label: 'Action', render: (row) => isAdmin ? (
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(row)} className="rounded-lg bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-600">Edit</button>
                  <button onClick={() => handleDelete(row.id)} className="rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-600">Delete</button>
                </div>
              ) : <span className="text-slate-400">—</span> }
            ]}
            rows={expenses}
            emptyText="No expenses found."
          />
        </div>

        {isAdmin && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit expense' : 'Add expense'}</h2>
            <div className="mt-5 space-y-3">
              <input
                value={form.expense_type}
                onChange={(e) => setForm({ ...form, expense_type: e.target.value })}
                placeholder="Expense type"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Amount"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  className="flex-1 rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-400"
                >
                  {editingId ? 'Update expense' : 'Save expense'}
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
