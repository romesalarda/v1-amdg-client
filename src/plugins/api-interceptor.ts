import { client } from '@/api/client.gen'

client.setConfig({
    baseUrl: useRuntimeConfig().public.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
})

export default defineNuxtPlugin(() => {
    const authStore = useAuthStore()
    let isRefreshing = false
    let failedQueue: Array<{ resolve: () => void; reject: (error: any) => void }> = []

    const processQueue = (error: any = null) => {
        failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error)
            } else {
                prom.resolve()
            }
        })
        failedQueue = []
    }

    // Add response interceptor
    client.interceptors.response.use(async (response, request, options) => {
        // If response is 401, try to refresh the token
        if (response.status === 401) {
            const originalRequest = request.clone()

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ 
                        resolve: () => {
                            // Retry the original request
                            fetch(originalRequest).then(resolve).catch(reject)
                        }, 
                        reject 
                    })
                })
            }

            isRefreshing = true

            try {
                // Attempt to refresh the token
                const refreshed = await authStore.refreshToken()

                if (refreshed) {
                    // Token refreshed successfully, retry all queued requests
                    processQueue()
                    isRefreshing = false

                    // Retry the original request
                    return fetch(originalRequest)
                } else {
                    // Token refresh failed, redirect to login
                    processQueue(new Error('Token refresh failed'))
                    isRefreshing = false
                    await authStore.handleUnauthorized()
                    return response
                }
            } catch (error) {
                // Token refresh failed, redirect to login
                processQueue(error)
                isRefreshing = false
                await authStore.handleUnauthorized()
                return response
            }
        }

        return response
    })
})
