"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    UserCircle,
    RefreshCw,
    Calendar
} from "lucide-react";
import {
    GET_PROFILES,
    CREATE_PROFILE,
    UPDATE_PROFILE,
    DELETE_PROFILE,
    type Profile,
    type GetProfilesResponse,
    type CreateProfileResponse,
    type UpdateProfileResponse,
    type DeleteProfileResponse,
    type CreateProfileDTO,
    type UpdateProfileDTO,
    type DeleteProfileDTO,
} from "@/lib/queries/profiles";
import { GET_USERS, type User, type GetUsersResponse } from "@/lib/queries/users";

interface ProfileFormData {
    bio: string;
    userId: string;
}

export default function ProfilesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>({ bio: "", userId: "" });

    // Fetch Profiles
    const { data, loading, error, refetch } = useQuery<GetProfilesResponse>(GET_PROFILES, {
        variables: {
            data: {
                take: pageSize,
                skip: (currentPage - 1) * pageSize
            }
        },
        fetchPolicy: 'cache-and-network'
    });

    // Fetch Users for the select dropdown
    const { data: usersData, loading: usersLoading } = useQuery<GetUsersResponse>(GET_USERS, {
        variables: { data: { take: 1000 } } // Fetch all users for the dropdown
    });

    const [createProfile, { loading: createLoading }] = useMutation<CreateProfileResponse>(CREATE_PROFILE);
    const [updateProfile, { loading: updateLoading }] = useMutation<UpdateProfileResponse>(UPDATE_PROFILE);
    const [deleteProfile, { loading: deleteLoading }] = useMutation<DeleteProfileResponse>(DELETE_PROFILE);

    useEffect(() => {
        refetch();
    }, [currentPage, refetch]);

    const profiles = data?.getProfiles?.data?.items || [];
    const users = usersData?.getUsers?.data?.items || [];
    const totalProfiles = data?.getProfiles?.data?.count || 0;
    const totalPages = Math.ceil(totalProfiles / pageSize);

    const profilesWithUserName = useMemo(() => {
        return profiles.map(profile => {
            const user = users.find(u => u.id === profile.userId);
            return { ...profile, userName: user?.name || 'Unknown User' };
        });
    }, [profiles, users]);

    const filteredProfiles = useMemo(() => {
        if (!searchTerm) return profilesWithUserName;
        return profilesWithUserName.filter(p => p.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [profilesWithUserName, searchTerm]);

    const handleCreateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await createProfile({
                variables: {
                    data: {
                        bio: formData.bio,
                        user: { connect: { id: parseInt(formData.userId) } }
                    } as CreateProfileDTO
                }
            });

            if (result.data?.createProfile?.data?.items?.length) {
                setIsCreateModalOpen(false);
                setFormData({ bio: "", userId: "" });
                refetch();
            }
        } catch (error) {
            console.error("Error creating profile:", error);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProfile) return;

        try {
            const result = await updateProfile({
                variables: {
                    data: {
                        id: selectedProfile.id,
                        bio: formData.bio,
                    } as UpdateProfileDTO
                }
            });

            if (result.data?.updateProfile?.data?.items?.length) {
                setIsEditModalOpen(false);
                refetch();
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleDeleteProfile = async () => {
        if (!selectedProfile) return;
        try {
            await deleteProfile({ variables: { data: { id: selectedProfile.id } } });
            setIsDeleteModalOpen(false);
            refetch();
        } catch (error) {
            console.error("Error deleting profile:", error);
        }
    };

    const openEditModal = (profile: Profile) => {
        setSelectedProfile(profile);
        setFormData({
            bio: profile.bio || "",
            userId: profile.userId.toString(),
        });
        setIsEditModalOpen(true);
    };

    const displayedProfiles = searchTerm ? filteredProfiles : profilesWithUserName;
    const actualTotalPages = searchTerm ? Math.ceil(filteredProfiles.length / 10) : totalPages;

    // Resetar página se for maior que o total de páginas
    useEffect(() => {
        if (currentPage > actualTotalPages && actualTotalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, actualTotalPages]);

    // Função para mudar página com validação
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

    const openDeleteModal = (profile: Profile) => {
        setSelectedProfile(profile);
        setIsDeleteModalOpen(true);
    };

    if (loading || usersLoading) {
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
                    <h3 className="font-medium">Erro ao carregar perfis</h3>
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
                    <h1 className="text-2xl font-bold text-gray-900">Perfis</h1>
                    <p className="text-gray-600">Gerencie os perfis dos usuários</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Novo Perfil
                </button>
            </div>

            {/* Filtros e busca */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar por nome de usuário..."
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

            {/* Tabela de perfis */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bio
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedProfiles.map((profile) => (
                                <tr key={profile.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <UserCircle className="h-5 w-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{profile.userName}</div>
                                                <div className="text-sm text-gray-500">ID: #{profile.userId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {profile.bio || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => openEditModal(profile)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(profile)}
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
                                    <span className="font-medium">{Math.min(currentPage * pageSize, searchTerm ? filteredProfiles.length : totalProfiles)}</span> de{' '}
                                    <span className="font-medium">{searchTerm ? filteredProfiles.length : totalProfiles}</span> perfis
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

            {/* Modal de Criar Perfil */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Perfil</h3>
                            <form onSubmit={handleCreateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Usuário
                                    </label>
                                    <select
                                        value={formData.userId}
                                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Selecione um usuário</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name || user.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Descreva o perfil do usuário..."
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

            {/* Modal de Editar Perfil */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Perfil</h3>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Usuário
                                    </label>
                                    <select
                                        value={formData.userId}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                                        disabled
                                    >
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name || user.email}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">O usuário não pode ser alterado</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Descreva o perfil do usuário..."
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

            {/* Modal de Deletar Perfil */}
            {isDeleteModalOpen && selectedProfile && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Deletar Perfil</h3>
                            <p className="text-gray-600 mb-4">
                                Tem certeza que deseja deletar o perfil do usuário <strong>{users.find(u => u.id === selectedProfile.userId)?.name || 'Usuário'}</strong>?
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
                                    onClick={handleDeleteProfile}
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