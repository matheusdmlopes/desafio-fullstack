import { gql } from "@apollo/client";

// TypeScript interfaces
export interface Profile {
    id: number;
    bio: string | null;
    userId: number;
}

export interface GetProfilesResponse {
    getProfiles: {
        data: {
            items: Profile[];
            count: number;
        };
    };
}

export interface CreateProfileResponse {
    createProfile: {
        data: {
            count: number;
            items: Profile[];
        };
    };
}

export interface UpdateProfileResponse {
    updateProfile: {
        data: {
            count: number;
            items: Profile[];
        };
    };
}

export interface DeleteProfileResponse {
    deleteProfile: {
        data: {
            count: number;
            items: Profile[];
        };
    };
}

// GraphQL Queries and Mutations
export const GET_PROFILES = gql`
  query GetProfiles($data: GetProfilesDTO!) {
    getProfiles(data: $data) {
      data {
        items {
          id
          bio
          userId
        }
        count
      }
    }
  }
`;

export const CREATE_PROFILE = gql`
    mutation CreateProfile($data: CreateProfileDTO!) {
        createProfile(data: $data) {
            data {
                count
                items {
                    id
                    bio
                    userId
                }
            }
        }
    }
`;

export const UPDATE_PROFILE = gql`
    mutation UpdateProfile($data: UpdateProfileDTO!) {
        updateProfile(data: $data) {
            data {
                count
                items {
                    id
                    bio
                    userId
                }
            }
        }
    }
`;

export const DELETE_PROFILE = gql`
    mutation DeleteProfile($data: DeleteProfileDTO!) {
        deleteProfile(data: $data) {
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
export interface GetProfilesDTO {
    take?: number;
    skip?: number;
}

export interface CreateProfileDTO {
    bio?: string | null;
    user: {
        connect: {
            id: number;
        }
    }
}

export interface UpdateProfileDTO {
    id: number;
    bio?: string | null;
    user?: {
        connect: {
            id: number;
        }
    }
}

export interface DeleteProfileDTO {
    id: number;
} 