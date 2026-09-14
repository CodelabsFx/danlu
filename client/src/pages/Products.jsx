import React, { useEffect, useState } from 'react'
import api, { getStoredUser } from '../api'
import DataTable from '../components/DataTable'

const emptyForm = {
  product_name: '',
  category: '',
  sku: '',
  unit_cost_price: 0,
  unit_selling_price: 0,
  current_stock_quantity: 0,
  min_stock_alert_threshold: 0
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const user = getStoredUser()
  const isAdmin = user?.role === 'owner'

  async function loadProducts() {
    try {
      const res = await api.get('/api/products')
      setProducts(res.data.products || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function handleCreate() {
    try {
      const payload = {
        ...form,
        unit_cost_price: Number(form.unit_cost_price),
        unit_selling_price: Number(form.unit_selling_price),
        current_stock_quantity: Number(form.current_stock_quantity),
        min_stock_alert_threshold: Number(form.min_stock_alert_threshold)
      }

      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload)
      } else {
        await api.post('/api/products', payload)
      }

      resetForm()
      await loadProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    }
  }

  function handleEdit(product) {
    setEditingId(product.id)
    setForm({
      product_name: product.product_name || '',
      category: product.category || '',
      sku: product.sku || '',
      unit_cost_price: product.unit_cost_price || 0,
      unit_selling_price: product.unit_selling_price || 0,
      current_stock_quantity: product.current_stock_quantity || 0,
      min_stock_alert_threshold: product.min_stock_alert_threshold || 0
    })
  }

  async function handleDelete(id) {
    try {
      if (!window.confirm('Delete this product?')) return
      await api.delete(`/api/products/${id}`)
      await loadProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-6 container">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Inventory</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Products</h1>
        </div>
        {!isAdmin && (
          <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            View-only access
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Stock list</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {products.length} items
            </span>
          </div>

          <DataTable
            columns={[
              { key: 'product_name', label: 'Name', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.product_name}</span> },
              { key: 'sku', label: 'SKU' },
              { key: 'current_stock_quantity', label: 'Stock' },
              { key: 'unit_selling_price', label: 'Price', render: (row) => `KSh ${Number(row.unit_selling_price || 0).toLocaleString()}` },
              { key: 'actions', label: 'Action', render: (row) => isAdmin ? (
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(row)} className="btn btn-primary px-3 py-1.5 text-xs">Edit</button>
                  <button onClick={() => handleDelete(row.id)} className="btn btn-danger px-3 py-1.5 text-xs">Delete</button>
                </div>
              ) : <span className="text-slate-400">—</span> }
            ]}
            rows={products}
            emptyText="No products found."
          />
        </div>

        {isAdmin && (
          <div className="card p-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit product' : 'Add product'}</h2>
            <div className="mt-5 space-y-3">
              <input
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                placeholder="Product name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/20"
              />
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Category"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/20"
              />
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="SKU"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/20"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  value={form.unit_cost_price}
                  onChange={(e) => setForm({ ...form, unit_cost_price: e.target.value })}
                  placeholder="Cost price"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/20"
                />
                <input
                  type="number"
                  value={form.unit_selling_price}
                  onChange={(e) => setForm({ ...form, unit_selling_price: e.target.value })}
                  placeholder="Selling price"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/20"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  value={form.current_stock_quantity}
                  onChange={(e) => setForm({ ...form, current_stock_quantity: e.target.value })}
                  placeholder="Stock"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/20"
                />
                <input
                  type="number"
                  value={form.min_stock_alert_threshold}
                  onChange={(e) => setForm({ ...form, min_stock_alert_threshold: e.target.value })}
                  placeholder="Low stock alert"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/20"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCreate} className="flex-1 btn btn-primary">
                  {editingId ? 'Update product' : 'Save product'}
                </button>
                {editingId && (
                  <button onClick={resetForm} className="btn btn-ghost">
                    Cancel
                  </button>
                )}
              </div>

              {editingId && (
                <button onClick={() => handleDelete(editingId)} className="w-full btn btn-danger">
                  Delete current product
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
