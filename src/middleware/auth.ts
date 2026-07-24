export default defineNuxtRouteMiddleware(async (to, from) => {
    // Always allow the maintenance page through without any auth checks.
    if (to.path === '/maintainance') return

    const auth = useAuthStore()
    const healthStore = useHealthStore()

    // Ensure auth is initialized before checking
    if (auth.initPromise) {
        await auth.initPromise
    } else if (!auth.isAuthenticated && !auth.loading) {
        await auth.fetchUser()
    }

    // If the network error interceptor marked the backend as unreachable during
    // the auth check above, redirect to maintenance instead of login.
    if (healthStore.isHealthy === false) {
        return navigateTo('/maintainance')
    }

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback']

    // Check if user is authenticated
    if (!auth.isAuthenticated) {
        if (!publicRoutes.includes(to.path)) {
            // Avoid a redundant navigation warning when already sitting at the
            // login page with the same redirect target (e.g. duplicate navigation
            // to a protected route while the login page is active).
            if (from.path === '/login' && String(from.query?.redirect ?? '') === to.fullPath) {
                return
            }
            // Store the original path as a query parameter
            return navigateTo({
                path: '/login',
                query: { redirect: to.fullPath }
            })
        }
    } else {
        if (to.path === '/login') {
            return navigateTo('/my-dashboard')
        }
    }
})
