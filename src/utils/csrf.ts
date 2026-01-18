/**
 * Get CSRF token from cookie
 * Django sets csrftoken cookie, we need to send it back as X-CSRFToken header
 * 
 * Note: HTTP-only cookies (access, refresh) are NOT accessible via document.cookie
 * Only the CSRF token cookie is accessible (HttpOnly=False) so we can read it
 */
export function getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null

    const name = 'csrftoken'
    const cookies = document.cookie.split(';')

    for (let cookie of cookies) {
        cookie = cookie.trim()
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1))
        }
    }

    return null
}
