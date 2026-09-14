import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Dashboard(){
  const [summary, setSummary] = useState(null)
  useEffect(()=>{
    async function load(){
      try{
        const now = new Date()
        const end = now.toISOString().slice(0,10)
        const start = end
        const res = await api.get(`/api/analytics/summary?start=${start}&end=${end}`)
        setSummary(res.data)
      }catch(err){
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      {summary ? (
        <div>
          <div>Total sales: {summary.total_sales}</div>
          <div>COGS: {summary.cogs}</div>
          <div>Expenses: {summary.expenses}</div>
          <div>Net Profit: {summary.actual_net_profit}</div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
}
