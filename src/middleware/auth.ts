export default defineNuxtRouteMiddleware((to, from) => {
    const auth = useAuthStore()

    // Check if user is authenticated
    if (!auth.isAuthenticated) {
        // Allow access to login page and functionality to avoid infinite loops
        if (to.path !== '/login' && to.path !== '/') {
            return navigateTo('/login')
        }
    } else {
        // If authenticated and trying to go to login, redirect to dashboard
        if (to.path === '/login') {
            return navigateTo('/admin/dashboard')
        }
    }
})
