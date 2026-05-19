import { organisationsControlsList } from '~/api/sdk.gen'
import { organisationsListMyPermissionsRetrieve } from '~/api/sdk.gen'
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  
  // Ensure user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Get organization ID from route
  const orgId = to.params.id
  
  if (!orgId) {
    return navigateTo('/communities')
  }

  // Check if user is a controller of this organization
  try {
    const response = await organisationsControlsList({
      query: {
        organisation: String(orgId),
        user: authStore.user?.id,
      }
    })

    const permissionsResponse = await organisationsListMyPermissionsRetrieve({
      path: {
        url_safe_title: String(orgId),
      }
    })



    const canRead = permissionsResponse.data?.can_view
    
    if (!canRead) {
      // User is not a controller
    //   useNuxtApp().$notyf?.error('You do not have permission to access this page')
      return navigateTo(`/403`)
    }
  } catch (error) {
    // console.error('Permission check error:', error)
    // useNuxtApp().$notyf?.error('Unable to verify permissions')
    return navigateTo(`/403`)
  }
})
