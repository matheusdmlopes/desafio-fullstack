import { gql } from "@apollo/client";

// TypeScript interfaces
export interface Category {
    id: number;
    name: string;
}

export interface GetCategoriesResponse {
    getCategorys: {
        data: {
            items: Category[];
            count: number;
        };
    };
}

export interface CreateCategoryResponse {
    createCategory: {
        data: {
            count: number;
            items: Category[];
        };
    };
}

export interface UpdateCategoryResponse {
    updateCategory: {
        data: {
            count: number;
            items: Category[];
        };
    };
}

export interface DeleteCategoryResponse {
    deleteCategory: {
        data: {
            count: number;
            items: Category[];
        };
    };
}

// GraphQL Queries and Mutations
export const GET_CATEGORIES = gql`
  query GetCategories($data: GetCategorysDTO!) {
    getCategorys(data: $data) {
      data {
        items {
          id
          name
        }
        count
      }
    }
  }
`;

export const CREATE_CATEGORY = gql`
    mutation CreateCategory($data: CreateCategoryDTO!) {
        createCategory(data: $data) {
            data {
                count
                items {
                    id
                    name
                }
            }
        }
    }
`;

export const UPDATE_CATEGORY = gql`
    mutation UpdateCategory($data: UpdateCategoryDTO!) {
        updateCategory(data: $data) {
            data {
                count
                items {
                    id
                    name
                }
            }
        }
    }
`;

export const DELETE_CATEGORY = gql`
    mutation DeleteCategory($data: DeleteCategoryDTO!) {
        deleteCategory(data: $data) {
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
export interface GetCategoriesDTO {
    take?: number;
    skip?: number;
}

export interface CreateCategoryDTO {
    name: string;
}

export interface UpdateCategoryDTO {
    id: number;
    name: string;
}

export interface DeleteCategoryDTO {
    id: number;
} 