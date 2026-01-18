import { useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  authLoginCreate,
  authLogoutCreate,
  authRefreshCreate,
  authGoogleAuthorizeCreate,
  authGoogleCallbackCreate,
} from '~/api/sdk.gen'
import type {
  AuthLoginCreateData,
  AuthRefreshCreateData,
  AuthGoogleAuthorizeCreateData,
  AuthGoogleCallbackCreateData,
} from '~/api/types.gen'

/**
 * Login with email and password
 */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AuthLoginCreateData['body']) => authLoginCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['profiles', 'me'] })
    },
  })
}

/**
 * Logout current user
 */
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authLogoutCreate(),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

/**
 * Refresh authentication token
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: (body: AuthRefreshCreateData['body']) => authRefreshCreate({ body }),
  })
}

/**
 * Initiate Google OAuth authorization
 */
export function useGoogleAuthorize() {
  return useMutation({
    mutationFn: (body: AuthGoogleAuthorizeCreateData['body']) => authGoogleAuthorizeCreate({ body }),
  })
}

/**
 * Handle Google OAuth callback
 */
export function useGoogleCallback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AuthGoogleCallbackCreateData['body']) => authGoogleCallbackCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['profiles', 'me'] })
    },
  })
}
