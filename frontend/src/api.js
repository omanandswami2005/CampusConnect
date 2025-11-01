import axios from 'axios'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' }
})

// Add: set/get Authorization header from token
export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete api.defaults.headers.common['Authorization']
    }
}

// Initialize from storage on load
setAuthToken(localStorage.getItem('token') || null)

// Request interceptor to always attach latest token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    console.log('[API] Request to:', config.url, '- Token:', token ? 'EXISTS' : 'MISSING')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
        console.log('[API] Authorization header set:', config.headers['Authorization'].substring(0, 20) + '...')
    }
    return config
})

// Response interceptor: on 401, clear token and auth header
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err?.response?.status === 401) {
            localStorage.removeItem('token')
            // keep club for UI label; user must re-login anyway
            setAuthToken(null)
        }
        return Promise.reject(err)
    }
)
