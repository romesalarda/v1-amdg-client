import { client } from '@/api/client.gen'

export default defineNuxtPlugin((nuxtApp) => {
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

    // Attach Bearer token and CSRF token to every request.
    // - Authorization Bearer: primary auth mechanism (cross-origin reliable)
    // - X-CSRFToken: required by DRF's SessionAuthentication CSRF enforcement
    //   when a sessionid cookie is present (csrftoken cookie is not HttpOnly so JS can read it)
    client.interceptors.request.use((request) => {
        const headers = new Headers(request.headers)

        const token = authStore.accessToken
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }

        // Read CSRF token from cookie (always present after first page load)
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1]
        if (csrfToken) {
            headers.set('X-CSRFToken', csrfToken)
        }

        return new Request(request, { headers })
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

    // Detect network-level failures (ERR_CONNECTION_REFUSED, etc.) and redirect
    // to the maintenance page. The error interceptor fires when fetch() itself
    // throws (i.e. no HTTP response at all — server is down / unreachable).
    client.interceptors.error.use(async (error, _response, _request, _options) => {
        // _response is undefined only for genuine network failures (ERR_CONNECTION_REFUSED,
        // DNS failure, etc.). HTTP error responses (401, 403, 500…) have a defined _response,
        // so we must NOT treat those as a maintenance condition.
        if (_response !== undefined) {
            throw error
        }

        const route = nuxtApp.$route as { path: string } | undefined
        const healthStore = useHealthStore()
        healthStore.setUnhealthy()

        if (route?.path !== '/maintainance') {
            await navigateTo('/maintainance', { replace: true })
        }

        throw error
    })
})

