"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    UserCircle,
    RefreshCw
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

    if (loading || usersLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="text-red-500 p-4">Error: {error.message}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">User Profiles</h1>
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between mb-4">
                    <div className="flex items-center w-full max-w-xs">
                        <Search className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search by user name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Profile
                    </button>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">User</th>
                            <th className="px-6 py-3 text-left">Bio</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProfiles.map(profile => (
                            <tr key={profile.id}>
                                <td className="px-6 py-4">{profile.userName}</td>
                                <td className="px-6 py-4">{profile.bio}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openEditModal(profile)} className="text-blue-600 mr-4"><Edit size={20} /></button>
                                    <button onClick={() => { setSelectedProfile(profile); setIsDeleteModalOpen(true); }} className="text-red-600"><Trash2 size={20} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">{isCreateModalOpen ? 'Create Profile' : 'Edit Profile'}</h2>
                        <form onSubmit={isCreateModalOpen ? handleCreateProfile : handleUpdateProfile}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">User</label>
                                <select
                                    value={formData.userId}
                                    onChange={e => setFormData({ ...formData, userId: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 rounded-md"
                                    required
                                    disabled={isEditModalOpen}
                                >
                                    <option value="">Select a User</option>
                                    {users.map(user => <option key={user.id} value={user.id}>{user.name || user.email}</option>)}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Bio</label>
                                <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md" rows={3}></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false) }} className="mr-4 px-4 py-2 rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded-md" disabled={createLoading || updateLoading}>
                                    {isCreateModalOpen ? 'Create' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && selectedProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Delete Profile</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete the profile for {users.find(u => u.id === selectedProfile.userId)?.name}?</p>
                        <div className="flex justify-end">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="mr-4 px-4 py-2 rounded-md">Cancel</button>
                            <button onClick={handleDeleteProfile} className="px-4 py-2 text-white bg-red-600 rounded-md" disabled={deleteLoading}>
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 