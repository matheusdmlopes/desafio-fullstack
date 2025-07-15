import { gql } from "@apollo/client";

// TypeScript interfaces
export interface LargeTable {
    id: number;
    name: string;
    value: number;
    timestamp: string;
    details: string;
}

export interface GetLargeTablesResponse {
    getLargeTables: {
        data: {
            items: LargeTable[];
            count: number;
        };
    };
}

export interface CreateLargeTableResponse {
    createLargeTable: {
        data: {
            count: number;
            items: LargeTable[];
        };
    };
}

export interface UpdateLargeTableResponse {
    updateLargeTable: {
        data: {
            count: number;
            items: LargeTable[];
        };
    };
}

export interface DeleteLargeTableResponse {
    deleteLargeTable: {
        data: {
            count: number;
            items: LargeTable[];
        };
    };
}

// GraphQL Queries and Mutations
export const GET_LARGE_TABLES = gql`
  query GetLargeTables($data: GetLargeTablesDTO!) {
    getLargeTables(data: $data) {
      data {
        items {
          id
          name
          value
          timestamp
          details
        }
        count
      }
    }
  }
`;

export const CREATE_LARGE_TABLE = gql`
    mutation CreateLargeTable($data: CreateLargeTableDTO!) {
        createLargeTable(data: $data) {
            data {
                count
                items {
                    id
                    name
                    value
                    timestamp
                    details
                }
            }
        }
    }
`;

export const UPDATE_LARGE_TABLE = gql`
    mutation UpdateLargeTable($data: UpdateLargeTableDTO!) {
        updateLargeTable(data: $data) {
            data {
                count
                items {
                    id
                    name
                    value
                    timestamp
                    details
                }
            }
        }
    }
`;

export const DELETE_LARGE_TABLE = gql`
    mutation DeleteLargeTable($data: DeleteLargeTableDTO!) {
        deleteLargeTable(data: $data) {
            data {
                count
                items {
                    id
                }
            }
        }
    }
`;

// DTOs
export interface GetLargeTablesDTO {
    take?: number;
    skip?: number;
}

export interface CreateLargeTableDTO {
    name: string;
    value: number;
    timestamp: string;
    details: string;
}

export interface UpdateLargeTableDTO {
    id: number;
    name?: string;
    value?: number;
    timestamp?: string;
    details?: string;
}

export interface DeleteLargeTableDTO {
    id: number;
} 