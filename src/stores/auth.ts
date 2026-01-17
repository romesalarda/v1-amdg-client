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
        loading: false,
        justLoggedOut: false  // Flag to prevent re-auth after logout
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
                    // Ensure user was actually fetched before considering login successful
                    if (!this.isAuthenticated) {
                        throw new Error('Failed to fetch user after login')
                    }
                }
            } catch (error) {
                console.error('Login failed:', error)
                this.user = null
                this.isAuthenticated = false
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
                        redirect_uri: window.location.origin + '/auth/callback'
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
                // Clear auth state FIRST, before API call and navigation
                // This ensures middleware sees the user as logged out
                this.user = null
                this.isAuthenticated = false

                // Then call the logout endpoint to clear server-side cookies
                await authLogoutCreate()
            } catch (error) {
                console.error('Logout failed:', error)
                // Even if API call fails, keep user logged out on client
            } finally {
                // Navigate to login page after state is cleared
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
