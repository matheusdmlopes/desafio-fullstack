// Mock JWT token helper for REST API calls
// Note: Backend JwtAuthGuard only decodes payload without signature verification
const createMockJWT = () => {
    const header = { typ: "JWT", alg: "HS256" }
    const payload = {
        sub: "mock-user-123",
        data: { role: "user", name: "Test User" },
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    }

    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64')
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')

    // Since backend doesn't verify signature, we can use a mock signature
    return `${base64Header}.${base64Payload}.mock-signature`
}

// Helper function for authenticated REST API calls
export const apiRequest = async (url: string, options: RequestInit = {}) => {
    const mockToken = createMockJWT()

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
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