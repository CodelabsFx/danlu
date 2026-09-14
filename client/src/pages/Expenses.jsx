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
    <div className="space-y-6 container">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Finance</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Expenses</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-5">
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
                  <button onClick={() => handleEdit(row)} className="btn btn-primary px-3 py-1.5 text-xs">Edit</button>
                  <button onClick={() => handleDelete(row.id)} className="btn btn-danger px-3 py-1.5 text-xs">Delete</button>
                </div>
              ) : <span className="text-slate-400">—</span> }
            ]}
            rows={expenses}
            emptyText="No expenses found."
          />
        </div>

        {isAdmin && (
          <div className="card p-5">
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
                <button onClick={handleCreate} className="flex-1 btn btn-primary">{editingId ? 'Update expense' : 'Save expense'}</button>
                {editingId && (
                  <button onClick={resetForm} className="btn btn-ghost">Cancel</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
