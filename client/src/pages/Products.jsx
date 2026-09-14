import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Products(){
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ product_name: '', sku: '', unit_selling_price: 0, current_stock_quantity: 0 })
  useEffect(()=>{
    async function load(){
      try{
        const res = await api.get('/api/products')
        setProducts(res.data.products)
      }catch(err){
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Products</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">SKU</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p=> (
            <tr key={p.id}>
              <td className="border p-2">{p.product_name}</td>
              <td className="border p-2">{p.sku}</td>
              <td className="border p-2">{p.current_stock_quantity}</td>
              <td className="border p-2">{p.unit_selling_price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 max-w-md">
        <h3 className="font-bold mb-2">Add Product</h3>
        <div className="mb-2">
          <input placeholder="Name" className="w-full p-2 border" value={form.product_name} onChange={e=>setForm({...form, product_name: e.target.value})} />
        </div>
        <div className="mb-2">
          <input placeholder="SKU" className="w-full p-2 border" value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} />
        </div>
        <div className="mb-2">
          <input placeholder="Price" type="number" className="w-full p-2 border" value={form.unit_selling_price} onChange={e=>setForm({...form, unit_selling_price: e.target.value})} />
        </div>
        <div className="mb-2">
          <input placeholder="Stock" type="number" className="w-full p-2 border" value={form.current_stock_quantity} onChange={e=>setForm({...form, current_stock_quantity: e.target.value})} />
        </div>
        <button className="px-3 py-1 bg-green-600 text-white" onClick={async ()=>{
          try{
            await api.post('/api/products', form)
            const res = await api.get('/api/products')
            setProducts(res.data.products)
            setForm({ product_name: '', sku: '', unit_selling_price: 0, current_stock_quantity: 0 })
          }catch(err){ alert(err.response?.data?.message || 'Create failed') }
        }}>Create</button>
      </div>
    </div>
  )
}
