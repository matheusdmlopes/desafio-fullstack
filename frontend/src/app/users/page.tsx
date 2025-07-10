"use client";

import { gql, useQuery } from "@apollo/client";

const GET_USERS = gql`
  query GetUsers {
    getUsers(data: {}) {
      data {
        items {
          id
          name
          email
        }
      }
    }
  }
`;

export default function UsersPage() {
    const { loading, error, data } = useQuery(GET_USERS);

    if (loading) return <p>Loading...</p>;
    if (error) {
        console.error("GraphQL Error:", error);
        return <p>Error: {error.message}</p>;
    }

    return (
        <div>
            <h1>Users</h1>
            <ul>
                {data.getUsers.data.items.map(({ id, name, email }: { id: string; name: string; email: string; }) => (
                    <li key={id}>
                        <p>
                            <strong>{name}</strong> ({email})
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
} 