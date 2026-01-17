export default defineNuxtRouteMiddleware((to, from) => {
    const auth = useAuthStore()

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/', '/auth/callback']

    // Check if user is authenticated
    if (!auth.isAuthenticated) {
        // Allow access to public routes
        if (!publicRoutes.includes(to.path)) {
            return navigateTo('/login')
        }
    } else {
        // If authenticated and trying to go to login, redirect to dashboard
        if (to.path === '/login') {
            return navigateTo('/admin/dashboard')
        }
    }
})
