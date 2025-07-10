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