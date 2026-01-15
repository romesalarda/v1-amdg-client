import { defineStore } from 'pinia'
import {
    authLoginCreate,
    authLogoutCreate,
    authGoogleAuthorizeCreate,
    usersMeRetrieve
} from '@/api/sdk.gen'
import type {
    AuthLoginCreateData,
    UsersMeRetrieveResponses
} from '@/api/types.gen'

type User = UsersMeRetrieveResponses[200]

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        isAuthenticated: false,
        loading: false
    }),

    actions: {
        async login(credentials: AuthLoginCreateData['body']) {
            this.loading = true
            try {
                const response = await authLoginCreate({
                    body: credentials
                })

                if (response.data) {
                    await this.fetchUser()
                }
            } catch (error) {
                console.error('Login failed:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async loginWithGoogle() {
            this.loading = true
            try {
                const response = await authGoogleAuthorizeCreate({
                    body: {
                        redirect_uri: window.location.origin + '/login'
                    }
                })

                if (response.data) {
                    const data = response.data as { authorization_url: string }
                    if (data.authorization_url) {
                        window.location.href = data.authorization_url
                    }
                }
            } catch (error) {
                console.error('Google login init failed:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchUser() {
            this.loading = true
            try {
                const response = await usersMeRetrieve()
                if (response.data) {
                    this.user = response.data
                    this.isAuthenticated = true
                }
            } catch (error) {
                this.user = null
                this.isAuthenticated = false
            } finally {
                this.loading = false
            }
        },

        async logout() {
            try {
                await authLogoutCreate()
            } catch (error) {
                console.error('Logout failed:', error)
            } finally {
                this.user = null
                this.isAuthenticated = false
                const router = useRouter()
                router.push('/login')
            }
        },

        async handleUnauthorized() {
            this.user = null
            this.isAuthenticated = false
            const router = useRouter()
            router.push('/login')
        }
    }
})
