import React, { useEffect, useMemo, useState } from 'react'
import api from '../api'

export default function POS() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/products')
        setProducts(res.data.products || [])
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const term = search.toLowerCase()
      return (
        product.product_name?.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term)
      )
    })
  }, [products, search])

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }

      return [...prev, { product_id: product.id, product_name: product.product_name, quantity: 1, unit_price: Number(product.unit_selling_price || 0) }]
    })
  }

  function updateQuantity(productId, delta) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product_id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function clearCart() {
    setCart([])
  }

  async function checkout() {
    if (!cart.length) return

    try {
      await api.post('/api/sales', {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        payment_method: 'cash'
      })

      alert('Sale recorded successfully')
      setCart([])
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed')
    }
  }

  const total = cart.reduce((sum, item) => sum + item.quantity * Number(item.unit_price || 0), 0)

  return (
    <div className="space-y-6 container">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Sales</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Point of sale</h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Products</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="w-52 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </div>

              <div className="grid gap-4 md:grid-cols-2">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card p-4 bg-slate-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">{product.product_name}</div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">{product.sku || 'No SKU'}</div>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                    {product.current_stock_quantity} in stock
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Price</div>
                    <div className="text-lg font-bold text-slate-900">KSh {Number(product.unit_selling_price || 0).toLocaleString()}</div>
                  </div>
                  <button onClick={() => addToCart(product)} className="btn btn-primary">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Cart</h2>
            <button onClick={clearCart} className="text-sm font-medium text-slate-500 hover:text-slate-700">Clear</button>
          </div>

          <div className="mt-5 space-y-3">
            {cart.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-3 py-10 text-center text-sm text-slate-500">No items selected yet.</div>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-800">{item.product_name}</div>
                      <div className="text-xs text-slate-500">KSh {Number(item.unit_price || 0).toLocaleString()} each</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      KSh {(item.quantity * Number(item.unit_price || 0)).toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.product_id, -1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-lg text-slate-700">−</button>
                      <span className="min-w-[2rem] text-center font-semibold text-slate-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-lg text-white">+</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>Total</span>
              <span className="text-lg font-bold text-white">KSh {Number(total || 0).toLocaleString()}</span>
            </div>
            <button onClick={checkout} disabled={!cart.length} className="mt-4 w-full btn btn-ghost text-slate-900 disabled:opacity-60">Checkout</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
