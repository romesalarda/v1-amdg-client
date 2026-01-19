/**
 * Uploads multipart/form-data to the API.
 * Designed to work within the Vue Query composable pattern.
 *
 * @param url - Relative API path (e.g., '/api/profiles/3/')
 * @param formData - FormData object containing files and fields
 * @param options - Optional configuration
 * @returns Promise resolving to the API response
 *
 * @example
 * const formData = new FormData()
 * formData.append('profile_picture', file)
 * formData.append('name', 'John')
 * await uploadMultipart('/api/profiles/1/', formData, { method: 'PATCH' })
 */
export async function uploadMultipart<T = unknown>(
  url: string,
  formData: FormData,
  options?: {
    method?: 'POST' | 'PUT' | 'PATCH'
  },
): Promise<T> {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl || 'http://localhost:8000'
  
  // Construct full URL
  const fullUrl = url.startsWith('http') 
    ? url 
    : `${apiUrl}${url.startsWith('/') ? url : `/${url}`}`

  // Use $fetch with proper multipart configuration
  return await $fetch<T>(fullUrl, {
    method: options?.method || 'POST',
    body: formData,
    credentials: 'include', // Include cookies for authentication
    // Don't set Content-Type - browser will set it with boundary
  })
}

/**
 * Type guard to check if a value is FormData
 */
export function isFormData(value: unknown): value is FormData {
  return value instanceof FormData
}
