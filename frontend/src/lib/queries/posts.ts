import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts($data: GetPostsDTO!) {
    getPosts(data: $data) {
      data {
        count
        items {
          id
          title
          content
          published
          authorId
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories($data: GetCategoriesDTO!) {
    getCategories(data: $data) {
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

export const GET_USERS = gql`
  query GetUsers($data: GetUsersDTO!) {
    getUsers(data: $data) {
      data {
        count
        items {
          id
          name
          email
        }
      }
    }
  }
`;


// Note: For individual posts, we use REST API (/posts/:id) for optimal performance
// instead of GraphQL, since backend doesn't process andWhere filters correctly

// TypeScript interfaces
export interface Author {
  id: string;
  name: string | null;
  email: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface PostCategory {
  category: Category;
}

export interface Post {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  // These will be populated separately
  author?: Author;
  categories?: PostCategory[];
}

export interface PostData {
  count: number;
  items: Post[];
}

export interface CategoryData {
  count: number;
  items: Category[];
}

export interface UserData {
  count: number;
  items: Author[];
}

export interface GetPostsResponse {
  getPosts: {
    data: PostData;
  };
}

export interface GetCategoriesResponse {
  getCategories: {
    data: CategoryData;
  };
}

export interface GetUsersResponse {
  getUsers: {
    data: UserData;
  };
} 