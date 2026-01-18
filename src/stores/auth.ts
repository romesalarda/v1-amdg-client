import { defineStore } from 'pinia'
import {
    authLoginCreate,
    authLogoutCreate,
    authRefreshCreate,
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
        initPromise: null as Promise<void> | null,  // Promise for initialization
        refreshTimer: null as ReturnType<typeof setTimeout> | null,  // Timer for proactive refresh
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
                    if (!this.isAuthenticated) {
                        throw new Error('Failed to fetch user after login')
                    }
                    this.scheduleTokenRefresh()
                }
            } catch (error) {
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
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchUser() {
            if (!this.initPromise) {
                this.initPromise = this._fetchUserInternal()
            }
            return this.initPromise
        },

        async _fetchUserInternal() {
            this.loading = true
            try {
                const response = await usersMeRetrieve()
                if (response.data) {
                    this.user = response.data
                    this.isAuthenticated = true
                    this.scheduleTokenRefresh()
                } else {
                    this.user = null
                    this.isAuthenticated = false
                }
            } catch (error) {
                this.user = null
                this.isAuthenticated = false
            } finally {
                this.loading = false
                this.initPromise = null
            }
        },

        async refreshToken() {
            try {
                const response = await authRefreshCreate({ 
                    body: { refresh: '' }
                })
                
                if (response.data) {
                    this.scheduleTokenRefresh()
                    return true
                }
                return false
            } catch (error) {
                return false
            }
        },

        scheduleTokenRefresh() {
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer)
            }

            if (import.meta.client && this.isAuthenticated) {
                const refreshInterval = 12 * 60 * 1000
                
                this.refreshTimer = setTimeout(async () => {
                    await this.refreshToken()
                }, refreshInterval)
            }
        },

        clearRefreshTimer() {
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer)
                this.refreshTimer = null
            }
        },

        async logout() {
            try {
                await authLogoutCreate()
            } catch (error) {
                // Continue with logout even if API call fails
            } finally {
                this.clearRefreshTimer()
                this.user = null
                this.isAuthenticated = false
                this.initPromise = null
                const router = useRouter()
                router.push('/login')
            }
        },

        async handleUnauthorized() {
            this.clearRefreshTimer()
            this.user = null
            this.isAuthenticated = false
            this.initPromise = null
            const router = useRouter()
            router.push('/login')
        }
    }
})
