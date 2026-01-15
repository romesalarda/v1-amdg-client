import { defineStore } from 'pinia'

interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'user'
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        isAuthenticated: false,
        loading: false
    }),

    actions: {
        async login(credentials: any) {
            this.loading = true
            try {
                // Mock Login
                await new Promise(resolve => setTimeout(resolve, 500))
                this.user = { id: '1', email: 'admin@amdg.church', name: 'Admin', role: 'admin' }
                this.isAuthenticated = true
            } finally {
                this.loading = false
            }
        },

        async logout() {
            // Mock logut
            this.user = null
            this.isAuthenticated = false
        },

        async handleUnauthorized() {
            await this.logout()
            // Redirect to login
            const router = useRouter()
            router.push('/login')
        }
    }
})
