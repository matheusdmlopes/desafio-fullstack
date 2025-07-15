"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Image from "next/image";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Zap,
    RefreshCw,
    Calendar
} from "lucide-react";
import {
    GET_POKEMONS,
    CREATE_POKEMON,
    UPDATE_POKEMON,
    DELETE_POKEMON,
    type Pokemon,
    type GetPokemonsResponse,
    type CreatePokemonResponse,
    type UpdatePokemonResponse,
    type DeletePokemonResponse,
    type CreatePokemonDTO,
    type UpdatePokemonDTO,
    type DeletePokemonDTO,
} from "@/lib/queries/pokemon";

interface PokemonFormData {
    name: string;
    type: string;
    ability: string;
    image: string;
}

export default function PokemonPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [formData, setFormData] = useState<PokemonFormData>({
        name: "",
        type: "",
        ability: "",
        image: "",
    });

    const { data, loading, error, refetch } = useQuery<GetPokemonsResponse>(GET_POKEMONS, {
        variables: {
            data: {
                take: pageSize,
                skip: (currentPage - 1) * pageSize,
            },
        },
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
    });

    const [createPokemon, { loading: createLoading }] = useMutation<CreatePokemonResponse>(CREATE_POKEMON);
    const [updatePokemon, { loading: updateLoading }] = useMutation<UpdatePokemonResponse>(UPDATE_POKEMON);
    const [deletePokemon, { loading: deleteLoading }] = useMutation<DeletePokemonResponse>(DELETE_POKEMON);

    useEffect(() => {
        refetch({
            data: {
                take: pageSize,
                skip: (currentPage - 1) * pageSize,
            },
        });
    }, [currentPage, pageSize, refetch]);

    const pokemons = data?.getPokemons?.data?.items || [];
    const totalPokemons = data?.getPokemons?.data?.count || 0;
    const totalPages = Math.ceil(totalPokemons / pageSize);

    const filteredPokemons = useMemo(() => {
        if (!searchTerm) return pokemons;
        return pokemons.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pokemons, searchTerm]);

    const displayedPokemons = searchTerm ? filteredPokemons : pokemons;
    const actualTotalPages = searchTerm ? Math.ceil(filteredPokemons.length / 10) : totalPages;

    useEffect(() => {
        if (currentPage > actualTotalPages && actualTotalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, actualTotalPages]);

    const handleCreatePokemon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await createPokemon({
                variables: { data: formData as CreatePokemonDTO }
            });

            if (result.data?.createPokemon?.data?.items?.length) {
                setIsCreateModalOpen(false);
                setFormData({ name: "", type: "", ability: "", image: "" });
                setCurrentPage(1);
                refetch();
            } else {
                console.error("Unexpected response:", result);
            }
        } catch (error) {
            console.error("Error creating pokemon:", error);
        }
    };

    const handleUpdatePokemon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPokemon) return;

        try {
            const result = await updatePokemon({
                variables: {
                    data: {
                        id: parseInt(selectedPokemon.id),
                        ...formData
                    } as UpdatePokemonDTO
                }
            });

            if (result.data?.updatePokemon?.data?.items?.length) {
                setIsEditModalOpen(false);
                setSelectedPokemon(null);
                setFormData({ name: "", type: "", ability: "", image: "" });
                refetch();
            } else {
                console.error("Unexpected response:", result);
            }
        } catch (error) {
            console.error("Error updating pokemon:", error);
        }
    };

    const handleDeletePokemon = async () => {
        if (!selectedPokemon) return;

        try {
            const result = await deletePokemon({
                variables: {
                    data: { id: parseInt(selectedPokemon.id) } as DeletePokemonDTO
                }
            });

            if (result.data?.deletePokemon?.data?.items?.length) {
                setIsDeleteModalOpen(false);
                setSelectedPokemon(null);
                if (displayedPokemons.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
                refetch();
            } else {
                console.error("Unexpected response:", result);
            }
        } catch (error) {
            console.error("Error deleting pokemon:", error);
        }
    };

    const openEditModal = (pokemon: Pokemon) => {
        setSelectedPokemon(pokemon);
        setFormData({
            name: pokemon.name,
            type: pokemon.type,
            ability: pokemon.ability,
            image: pokemon.image
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (pokemon: Pokemon) => {
        setSelectedPokemon(pokemon);
        setIsDeleteModalOpen(true);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= actualTotalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800">
                    <h3 className="font-medium">Erro ao carregar pokémons</h3>
                    <p className="text-sm mt-1">{error.message}</p>
                    <button
                        onClick={() => {
                            setCurrentPage(1);
                            refetch();
                        }}
                        className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pokémons</h1>
                    <p className="text-gray-600">Gerencie os pokémons do sistema</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Novo Pokémon
                </button>
            </div>

            {/* Filtros e busca */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou tipo..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset para página 1 ao buscar
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Atualizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabela de pokémons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pokémon
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Habilidade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedPokemons.map((pokemon) => (
                                <tr key={pokemon.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {pokemon.image ? (
                                                    <Image
                                                        src={pokemon.image}
                                                        alt={pokemon.name}
                                                        width={40}
                                                        height={40}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <Zap className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{pokemon.name}</div>
                                                <div className="text-sm text-gray-500">#{pokemon.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {pokemon.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">{pokemon.ability}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => openEditModal(pokemon)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(pokemon)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === actualTotalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próxima
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando{' '}
                                    <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> até{' '}
                                    <span className="font-medium">{Math.min(currentPage * pageSize, searchTerm ? filteredPokemons.length : totalPokemons)}</span> de{' '}
                                    <span className="font-medium">{searchTerm ? filteredPokemons.length : totalPokemons}</span> pokémons
                                    {searchTerm && <span className="text-gray-500"> (filtrados)</span>}
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    {[...Array(Math.min(actualTotalPages, 5))].map((_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === actualTotalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Próxima
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Criar Pokémon */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Pokémon</h3>
                            <form onSubmit={handleCreatePokemon} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipo
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Habilidade
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.ability}
                                            onChange={(e) => setFormData({ ...formData, ability: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL da Imagem
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {createLoading ? "Criando..." : "Criar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Editar Pokémon */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Pokémon</h3>
                            <form onSubmit={handleUpdatePokemon} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipo
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Habilidade
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.ability}
                                            onChange={(e) => setFormData({ ...formData, ability: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL da Imagem
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {updateLoading ? "Salvando..." : "Salvar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Deletar Pokémon */}
            {isDeleteModalOpen && selectedPokemon && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Deletar Pokémon</h3>
                            <p className="text-gray-600 mb-4">
                                Tem certeza que deseja deletar o pokémon <strong>{selectedPokemon.name}</strong>?
                                Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeletePokemon}
                                    disabled={deleteLoading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {deleteLoading ? "Deletando..." : "Deletar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 