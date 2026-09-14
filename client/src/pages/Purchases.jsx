import React, { useEffect, useState } from 'react'
import api from '../api'
import DataTable from '../components/DataTable'

const emptyForm = {
  supplier_name: '',
  payment_method: 'cash',
  product_id: '',
  quantity: 1,
  unit_cost_price: 0
}

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)

  async function loadData() {
    const [purchasesRes, productsRes] = await Promise.all([
      api.get('/api/purchases'),
      api.get('/api/products')
    ])
    setPurchases(purchasesRes.data.purchases || [])
    setProducts(productsRes.data.products || [])
  }

  useEffect(() => {
    loadData().catch((err) => console.error(err))
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (!form.supplier_name || !form.product_id) return

    try {
      await api.post('/api/purchases', {
        supplier_name: form.supplier_name,
        payment_method: form.payment_method,
        items: [{
          product_id: Number(form.product_id),
          quantity: Number(form.quantity || 0),
          unit_cost_price: Number(form.unit_cost_price || 0)
        }]
      })

      setForm(emptyForm)
      await loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Purchase failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Purchases</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Supplier purchases</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Record purchase</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Supplier</label>
              <input
                value={form.supplier_name}
                onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Acme Supply"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Product</label>
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.product_name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Unit cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unit_cost_price}
                  onChange={(e) => setForm({ ...form, unit_cost_price: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Payment method</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
            >
              Save purchase
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent purchases</h2>
          <div className="mt-4">
            <DataTable
              columns={[
                { key: 'supplier_name', label: 'Supplier' },
                { key: 'total_amount', label: 'Total', render: (row) => `KSh ${Number(row.total_amount || 0).toLocaleString()}` },
                { key: 'payment_method', label: 'Payment' },
                { key: 'purchase_date', label: 'Date', render: (row) => new Date(row.purchase_date).toLocaleDateString() }
              ]}
              rows={purchases}
              emptyText="No purchases found."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
