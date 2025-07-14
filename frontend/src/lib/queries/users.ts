import { gql } from "@apollo/client";

// Tipos TypeScript
export interface User {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetUsersResponse {
    getUsers: {
        data: {
            items: User[];
            count: number;
        };
    };
}

export interface CreateUserResponse {
    createUser: {
        data: User;
    };
}

export interface UpdateUserResponse {
    updateUser: {
        data: User;
    };
}

export interface DeleteUserResponse {
    deleteUser: {
        data: User;
    };
}

// Query para buscar usuários
export const GET_USERS = gql`
  query GetUsers($data: GetUsersDTO!) {
    getUsers(data: $data) {
      data {
        items {
          id
          email
          name
          createdAt
          updatedAt
        }
        count
      }
    }
  }
`;

// Query para buscar usuário por ID
export const GET_USER_BY_ID = gql`
  query GetUserById($data: GetUsersDTO!) {
    getUsers(data: $data) {
      data {
        items {
          id
          email
          name
          createdAt
          updatedAt
        }
      }
    }
  }
`;

// Mutation para criar usuário
export const CREATE_USER = gql`
  mutation CreateUser($data: CreateUserDTO!) {
    createUser(data: $data) {
      data {
        id
        email
        name
        createdAt
        updatedAt
      }
    }
  }
`;

// Mutation para atualizar usuário
export const UPDATE_USER = gql`
  mutation UpdateUser($data: UpdateUserDTO!) {
    updateUser(data: $data) {
      data {
        id
        email
        name
        createdAt
        updatedAt
      }
    }
  }
`;

// Mutation para deletar usuário
export const DELETE_USER = gql`
  mutation DeleteUser($data: DeleteUserDTO!) {
    deleteUser(data: $data) {
      data {
        id
        email
        name
        createdAt
        updatedAt
      }
    }
  }
`;

// DTOs para as operações
export interface GetUsersDTO {
    take?: number;
    skip?: number;
    id?: number;
    email?: string;
    name?: string;
}

export interface CreateUserDTO {
    email: string;
    name: string;
}

export interface UpdateUserDTO {
    id: number;
    email?: string;
    name?: string;
}

export interface DeleteUserDTO {
    id: number;
} 