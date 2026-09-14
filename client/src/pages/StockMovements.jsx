import React, { useEffect, useState } from 'react'
import api from '../api'
import DataTable from '../components/DataTable'

export default function StockMovements() {
  const [movements, setMovements] = useState([])

  useEffect(() => {
    api.get('/api/stock-movements')
      .then((res) => setMovements(res.data.movements || []))
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Inventory</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Stock movements</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <DataTable
          columns={[
            { key: 'product_name', label: 'Product' },
            { key: 'movement_type', label: 'Type' },
            { key: 'quantity_change', label: 'Qty change' },
            { key: 'reference_type', label: 'Reference' },
            { key: 'created_at', label: 'Date', render: (row) => new Date(row.created_at).toLocaleString() }
          ]}
          rows={movements}
          emptyText="No stock movements recorded."
        />
      </div>
    </div>
  )
}
