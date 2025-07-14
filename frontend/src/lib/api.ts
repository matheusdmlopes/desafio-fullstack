// Helper function for authenticated REST API calls
export const apiRequest = async (url: string, options: RequestInit = {}) => {
    // Get token from localStorage (managed by useAuth hook)
    const token = localStorage.getItem('auth_token');

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
    }

    const response = await fetch(url, config)

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

export const API_BASE_URL = 'http://localhost:3000' 