import { gql } from "@apollo/client";

export const GET_POKEMONS = gql`
  query GetPokemons($data: GetPokemonsDTO!) {
    getPokemons(data: $data) {
      data {
        count
        items {
          id
          name
          type
          ability
          image
          createdAt
        }
      }
    }
  }
`;

export const GET_POKEMON_BY_ID = gql`
  query GetPokemonById($data: GetPokemonsDTO!) {
    getPokemons(data: $data) {
      data {
        items {
          id
          name
          type
          ability
          image
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const CREATE_POKEMON = gql`
    mutation CreatePokemon($data: CreatePokemonDTO!) {
        createPokemon(data: $data) {
            data {
                count
                items {
                    id
                    name
                    type
                    ability
                    image
                }
            }
        }
    }
`;

export const UPDATE_POKEMON = gql`
    mutation UpdatePokemon($data: UpdatePokemonDTO!) {
        updatePokemon(data: $data) {
            data {
                count
                items {
                    id
                    name
                    type
                    ability
                    image
                }
            }
        }
    }
`;

export const DELETE_POKEMON = gql`
    mutation DeletePokemon($data: DeletePokemonDTO!) {
        deletePokemon(data: $data) {
            data {
                count
                items {
                    id
                }
            }
        }
    }
`;

// Types for TypeScript
export interface Pokemon {
  id: string;
  name: string;
  type: string;
  ability: string;
  image: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PokemonData {
  count: number;
  items: Pokemon[];
}

export interface GetPokemonsResponse {
  getPokemons: {
    data: PokemonData;
  };
}

export interface CreatePokemonDTO {
  name: string;
  type: string;
  ability: string;
  image: string;
}

export interface UpdatePokemonDTO {
  id: number;
  name?: string;
  type?: string;
  ability?: string;
  image?: string;
}

export interface DeletePokemonDTO {
  id: number;
}

export interface CreatePokemonResponse {
  createPokemon: {
    data: {
      count: number;
      items: Pokemon[];
    };
  };
}

export interface UpdatePokemonResponse {
  updatePokemon: {
    data: {
      count: number;
      items: Pokemon[];
    };
  };
}

export interface DeletePokemonResponse {
  deletePokemon: {
    data: {
      count: number;
      items: Pokemon[];
    };
  };
} 