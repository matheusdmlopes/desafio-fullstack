import { gql } from "@apollo/client";

// Query para buscar contagens de usuários
export const GET_USERS_COUNT = gql`
  query GetUsersCount {
    getUsers(data: { take: 1 }) {
      data {
        count
      }
    }
  }
`;

// Query para buscar contagens de posts
export const GET_POSTS_COUNT = gql`
  query GetPostsCount {
    getPosts(data: { take: 1 }) {
      data {
        count
      }
    }
  }
`;

// Query para buscar contagens de categorias
export const GET_CATEGORIES_COUNT = gql`
  query GetCategoriesCount {
    getCategories(data: { take: 1 }) {
      data {
        count
      }
    }
  }
`;

// Query para buscar contagens de pokemon
export const GET_POKEMON_COUNT = gql`
  query GetPokemonCount {
    getPokemons(data: { take: 1 }) {
      data {
        count
      }
    }
  }
`;

// Query para buscar contagens de perfis
export const GET_PROFILES_COUNT = gql`
  query GetProfilesCount {
    getProfiles(data: { take: 1 }) {
      data {
        count
      }
    }
  }
`;

// Query para buscar contagens de large table
export const GET_LARGE_TABLE_COUNT = gql`
  query GetLargeTableCount {
    getLargeTables(data: { take: 1 }) {
      data {
        count
      }
    }
  }
`;

// Query para buscar posts recentes
export const GET_RECENT_POSTS = gql`
  query GetRecentPosts {
    getPosts(data: { take: 5 }) {
      data {
        items {
          id
          title
          published
          createdAt
          authorId
        }
      }
    }
  }
`;

// Query para buscar estatísticas de posts
export const GET_POSTS_STATS = gql`
  query GetPostsStats {
    getPosts(data: { take: 1000 }) {
      data {
        items {
          id
          published
          createdAt
        }
      }
    }
  }
`;

// Tipos TypeScript para as respostas
export interface DashboardCounts {
    users: number;
    posts: number;
    categories: number;
    pokemon: number;
    profiles: number;
    largeTables: number;
}

export interface RecentPost {
    id: string;
    title: string;
    published: boolean;
    createdAt: string;
    authorId: string;
}

export interface PostStats {
    total: number;
    published: number;
    draft: number;
    recentCount: number; // posts nos últimos 7 dias
}

export interface AnalyticsData {
    recordCount: number;
    data: Array<{
        user_id: string;
        user_name: string;
        email: string;
        total_posts: number;
        published_posts: number;
        user_classification: string;
        activity_status: string;
        engagement_score: number;
    }>;
} 