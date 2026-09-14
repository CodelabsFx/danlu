import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '' })

export function setAuthToken(token) {
  api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// load token from localStorage if available
const existing = localStorage.getItem('token')
if (existing) setAuthToken(existing)

export default api

export async function uploadProductImage(productId, file) {
  const fd = new FormData()
  fd.append('image', file)
  const res = await api.post(`/api/products/${productId}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}

export async function downloadReport(type = 'pnl', start, end) {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (start) params.set('start', start)
  if (end) params.set('end', end)
  const res = await api.get(`/api/reports?${params.toString()}`, { responseType: 'blob' })
  return res.data
}
