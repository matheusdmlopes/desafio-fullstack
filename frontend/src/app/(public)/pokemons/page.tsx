"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Search, Filter, Zap, Grid, List } from "lucide-react";
import { GET_POKEMONS, GetPokemonsResponse } from "@/lib/queries/pokemon";
import PokemonCard from "@/components/pokemon/PokemonCard";

export default function PokemonsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // GraphQL Query
    const { loading, error, data } = useQuery<GetPokemonsResponse>(GET_POKEMONS, {
        variables: {
            data: {
                take: 100, // Load all Pokemon (increased from 50 to show all 80)
                skip: 0,
            },
        },
    });

    // Get unique types for filter
    const uniqueTypes = data
        ? [...new Set(data.getPokemons.data.items.map(pokemon => pokemon.type))]
        : [];

    // Filter Pokemon based on search and type
    const filteredPokemons = data?.getPokemons.data.items.filter(pokemon => {
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pokemon.ability.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "" || pokemon.type === selectedType;
        return matchesSearch && matchesType;
    }) || [];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                        <span className="ml-3 text-lg text-gray-600">Loading Pokemon...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="text-red-500 text-lg mb-4">Error loading Pokemon</div>
                        <div className="text-gray-600">{error.message}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <Zap className="h-16 w-16" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">
                            Coleção de Pokémon
                        </h1>
                        <p className="text-xl leading-8 text-yellow-100 max-w-3xl mx-auto mb-8">
                            Explore nossa incrível coleção de Pokémon com seus tipos e habilidades únicos.
                            Descubra o Pokémon perfeito para sua equipe!
                        </p>
                        <div className="text-lg">
                            <span className="bg-yellow-600 text-white px-4 py-2 rounded-full">
                                {data?.getPokemons.data.count || 0} Pokémon disponíveis
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search and Filters */}
            <section className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Pesquisar Pokémon por nome ou habilidade..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                            >
                                <option value="">Todos os tipos</option>
                                {uniqueTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "grid"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                <Grid className="h-4 w-4 mr-1" />
                                Grade
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "list"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                <List className="h-4 w-4 mr-1" />
                                Lista
                            </button>
                        </div>
                    </div>

                    {/* Results info */}
                    <div className="mt-4 text-sm text-gray-600">
                        Mostrando {filteredPokemons.length} de {data?.getPokemons.data.count || 0} Pokémon
                        {searchTerm && ` matching "${searchTerm}"`}
                        {selectedType && ` of type "${selectedType}"`}
                    </div>
                </div>
            </section>

            {/* Pokemon Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredPokemons.length === 0 ? (
                        <div className="text-center py-16">
                            <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum Pokémon encontrado</h3>
                            <p className="text-gray-600">
                                Tente ajustar seus termos de pesquisa ou filtros para encontrar mais Pokémon.
                            </p>
                        </div>
                    ) : (
                        <div className={`${viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            : "space-y-4"
                            }`}>
                            {filteredPokemons.map((pokemon) => (
                                <PokemonCard key={pokemon.id} pokemon={pokemon} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
} 