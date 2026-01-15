export default defineNuxtPlugin(async (nuxtApp) => {
    const auth = useAuthStore()

    // Only fetch user on client-side to avoid hydration mismatch if using cookies that might not be passed correctly in SSR or if desired behavior is client-only
    // However, for best UX, we usually want to know auth state immediately. 
    // Since we are using http-only cookies, SSR fetch should work if cookie is passed.
    // For now, let's do it client-side or check if cookie exists.

    // Simple approach: Check auth on load
    if (import.meta.client) {
        await auth.fetchUser()
    }
})
