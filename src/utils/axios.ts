import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '~/stores/auth'

// Use current origin (proxy) by default in dev, or VITE_API_URL if set
const BASE_URL = import.meta.env.VITE_API_URL || ''


const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true, // For HttpOnly cookies
})

axiosInstance.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore()
        /* 
        // If using Bearer tokens (non-HttpOnly setup)
        if (authStore.token) {
          config.headers.Authorization = `Bearer ${authStore.token}`
        }
        */
        // For HttpOnly cookies, we rely on withCredentials: true
        // But we might need X-CSRFToken if using DRF default session auth
        return config
    },
    (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const authStore = useAuthStore()
        if (error.response?.status === 401) {
            // Handle 401: Refresh token or logout
            await authStore.handleUnauthorized()
        }
        return Promise.reject(error)
    }
)

export { axiosInstance }
