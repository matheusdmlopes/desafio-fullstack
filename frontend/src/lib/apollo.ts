import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
    uri: 'http://localhost:3000/graphql', // Backend port
});

// Mock JWT token for development/testing
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

const authLink = setContext((_, { headers }) => {
    const mockToken = createMockJWT()

    return {
        headers: {
            ...headers,
            authorization: `Bearer ${mockToken}`,
        }
    }
})

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
}); 