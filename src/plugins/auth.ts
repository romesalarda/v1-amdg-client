export default defineNuxtPlugin(async (nuxtApp) => {
    const auth = useAuthStore()
    
    try {
        // On every page load the in-memory accessToken is gone (SPA reload).
        // Attempt a silent refresh using the HttpOnly refresh cookie to restore it,
        // then fetch the user profile with the new Bearer token.
        const refreshed = await auth.refreshToken()
        if (refreshed) {
            await auth.fetchUser()
        }
    } catch (error) {
        // Not authenticated — silently ignore
    }
})
