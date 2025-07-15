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
    RefreshCw
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
        setFormData(pokemon);
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

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="text-red-500 p-4">Error loading pokemons: {error.message}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Pokemons</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Pokemon
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center mb-4">
                    <Search className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search pokemons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ability</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedPokemons.map(p => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4"><Image src={p.image} alt={p.name} width={40} height={40} className="rounded-full" /></td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{p.type}</td>
                                    <td className="px-6 py-4 text-gray-500">{p.ability}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEditModal(p)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit className="h-5 w-5" /></button>
                                        <button onClick={() => openDeleteModal(p)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-700">Page {currentPage} of {actualTotalPages}</span>
                    <div>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded-md mr-2 disabled:opacity-50">Previous</button>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === actualTotalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>

            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">{isCreateModalOpen ? 'Create Pokemon' : 'Edit Pokemon'}</h2>
                        <form onSubmit={isCreateModalOpen ? handleCreatePokemon : handleUpdatePokemon}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="col-span-2 border-gray-300 rounded-md" required />
                                <input type="text" placeholder="Type" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="border-gray-300 rounded-md" required />
                                <input type="text" placeholder="Ability" value={formData.ability} onChange={e => setFormData({ ...formData, ability: e.target.value })} className="border-gray-300 rounded-md" required />
                                <input type="text" placeholder="Image URL" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="col-span-2 border-gray-300 rounded-md" required />
                            </div>
                            <div className="flex justify-end">
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="mr-4 px-4 py-2 text-gray-700 bg-gray-100 rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded-md" disabled={createLoading || updateLoading}>
                                    {isCreateModalOpen ? 'Create' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && selectedPokemon && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Delete Pokemon</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete "{selectedPokemon.name}"?</p>
                        <div className="flex justify-end">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="mr-4 px-4 py-2 rounded-md">Cancel</button>
                            <button onClick={handleDeletePokemon} className="px-4 py-2 text-white bg-red-600 rounded-md" disabled={deleteLoading}>
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 