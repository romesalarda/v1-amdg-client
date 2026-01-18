export default defineNuxtPlugin(async (nuxtApp) => {
    const auth = useAuthStore()
    
    try {
        await auth.fetchUser()
    } catch (error) {
        // Failed to fetch user - user is not authenticated
    }
})
