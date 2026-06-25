// Base Axios instance — all requests go through /api (proxied by Vite in dev)
import axios from 'axios'

const isProd = import.meta.env.PROD;

const api = axios.create({
  baseURL: isProd ? 'https://autonidhi-backend.onrender.com/api/v1' : '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — clear token and redirect to login
// BUT skip redirect on public pages (homepage, login, signup, etc.)
const PUBLIC_PATHS = ['/', '/login', '/signup', '/forgot-password', '/reset-password']

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 &&
        error.config?.headers?.['X-Skip-Auth-Redirect'] !== 'true') {
      // Only redirect if user is actually on a protected page
      const currentPath = window.location.pathname
      const isPublicPage = PUBLIC_PATHS.some(p => currentPath === p || currentPath.startsWith('/reset-password'))
      if (!isPublicPage) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
