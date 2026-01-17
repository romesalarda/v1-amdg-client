/**
 * Get CSRF token from cookie
 * Django sets csrftoken cookie, we need to send it back as X-CSRFToken header
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
