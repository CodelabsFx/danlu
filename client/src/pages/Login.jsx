import React, { useState } from 'react'
import api, { setAuthToken } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      const res = await api.post('/api/auth/login', { email, password })
      const { token } = res.data
      localStorage.setItem('token', token)
      setAuthToken(token)
      nav('/')
    }catch(err){
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      {error && <div className="p-2 bg-red-100 mb-2">{error}</div>}
      <form onSubmit={submit}>
        <div className="mb-2">
          <label className="block">Email</label>
          <input className="w-full p-2 border" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block">Password</label>
          <input type="password" className="w-full p-2 border" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white">Sign in</button>
      </form>
    </div>
  )
}
