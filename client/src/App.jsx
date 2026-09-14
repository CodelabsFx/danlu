import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import POS from './pages/POS'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <div>
      <nav className="p-4 bg-gray-100 flex items-center">
        <Link to="/" className="mr-4">Dashboard</Link>
        <Link to="/products" className="mr-4">Products</Link>
        <Link to="/pos" className="mr-4">POS</Link>
        <div className="ml-auto">
          <button onClick={()=>{ localStorage.removeItem('token'); window.location.href = '/login' }} className="px-3 py-1 bg-red-500 text-white">Logout</button>
        </div>
      </nav>

      <main className="p-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
