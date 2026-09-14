import React, { useEffect, useState } from 'react'
import api from '../api'

export default function POS(){
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])

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

  function addToCart(product){
    setCart(prev => {
      const existing = prev.find(i=>i.product_id===product.id)
      if (existing) return prev.map(i=> i.product_id===product.id ? { ...i, quantity: i.quantity+1 } : i)
      return [...prev, { product_id: product.id, quantity: 1, unit_price: product.unit_selling_price }]
    })
  }

  async function checkout(){
    try{
      await api.post('/api/sales', { items: cart.map(i=>({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })), payment_method: 'cash' })
      alert('Sale recorded')
      setCart([])
    }catch(err){
      alert(err.response?.data?.message || 'Checkout failed')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Point of Sale</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h3>Products</h3>
          <ul>
            {products.map(p=> (
              <li key={p.id} className="p-2 border mb-2">
                <div className="font-bold">{p.product_name}</div>
                <div>Price: {p.unit_selling_price}</div>
                <div>Stock: {p.current_stock_quantity}</div>
                <button className="mt-2 px-2 py-1 bg-green-600 text-white" onClick={()=>addToCart(p)}>Add</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-2">
          <h3>Cart</h3>
          <ul>
            {cart.map(item=> (
              <li key={item.product_id} className="p-2 border mb-2">
                Product: {item.product_id} — Qty: {item.quantity} — Unit: {item.unit_price}
              </li>
            ))}
          </ul>
          <button className="px-4 py-2 bg-blue-600 text-white" onClick={checkout}>Checkout</button>
        </div>
      </div>
    </div>
  )
}
