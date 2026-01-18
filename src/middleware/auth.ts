export default defineNuxtRouteMiddleware(async (to, from) => {
    const auth = useAuthStore()

    // Ensure auth is initialized before checking
    if (auth.initPromise) {
        await auth.initPromise
    } else if (!auth.isAuthenticated && !auth.loading) {
        await auth.fetchUser()
    }

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/', '/auth/callback']

    // Check if user is authenticated
    if (!auth.isAuthenticated) {
        if (!publicRoutes.includes(to.path)) {
            return navigateTo('/login')
        }
    } else {
        if (to.path === '/login') {
            return navigateTo('/admin/dashboard')
        }
    }
})
