import { client } from '@/api/client.gen'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    client.setConfig({
        baseUrl: config.public.apiBaseUrl as string,
        credentials: 'include',  // Needed so the HttpOnly refresh cookie is sent on /auth/refresh/
        headers: {
            'Content-Type': 'application/json'
        }
    })

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

    // Attach Bearer token to every request from the in-memory access token.
    // This is the primary auth mechanism for cross-origin requests —
    // HttpOnly cookie sending is unreliable from a different domain.
    client.interceptors.request.use((request) => {
        const token = authStore.accessToken
        if (token) {
            const headers = new Headers(request.headers)
            headers.set('Authorization', `Bearer ${token}`)
            return new Request(request, { headers })
        }
        return request
    })

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
                            // Retry original request — by now accessToken is refreshed so
                            // the request interceptor above will attach the new Bearer token
                            const headers = new Headers(originalRequest.headers)
                            if (authStore.accessToken) {
                                headers.set('Authorization', `Bearer ${authStore.accessToken}`)
                            }
                            fetch(new Request(originalRequest, { headers })).then(resolve).catch(reject)
                        }, 
                        reject 
                    })
                })
            }

            isRefreshing = true

            try {
                // Attempt to refresh the token (uses HttpOnly refresh cookie)
                const refreshed = await authStore.refreshToken()

                if (refreshed) {
                    processQueue()
                    isRefreshing = false

                    // Retry with updated Bearer token
                    const headers = new Headers(originalRequest.headers)
                    if (authStore.accessToken) {
                        headers.set('Authorization', `Bearer ${authStore.accessToken}`)
                    }
                    return fetch(new Request(originalRequest, { headers }))
                } else {
                    processQueue(new Error('Token refresh failed'))
                    isRefreshing = false
                    await authStore.handleUnauthorized()
                    return response
                }
            } catch (error) {
                processQueue(error)
                isRefreshing = false
                await authStore.handleUnauthorized()
                return response
            }
        }

        return response
    })
})

