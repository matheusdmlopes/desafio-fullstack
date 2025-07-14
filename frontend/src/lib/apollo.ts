import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
    uri: 'http://localhost:3000/graphql', // Backend port
});

const authLink = setContext((_, { headers }) => {
    // Get token from localStorage (managed by useAuth hook)
    const token = localStorage.getItem('auth_token');

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        }
    }
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
}); 