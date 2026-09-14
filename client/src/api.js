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
