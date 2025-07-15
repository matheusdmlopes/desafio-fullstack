"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    FileText,
    BookOpen,
    ToggleLeft,
    ToggleRight,
    MoreVertical,
    RefreshCw
} from "lucide-react";
import {
    GET_POSTS,
    CREATE_POST,
    UPDATE_POST,
    DELETE_POST,
    type Post,
    type GetPostsResponse,
    type CreatePostResponse,
    type UpdatePostResponse,
    type DeletePostResponse,
    type CreatePostDTO,
    type UpdatePostDTO,
    type DeletePostDTO
} from "@/lib/queries/posts";

interface PostFormData {
    title: string;
    content: string;
    published: boolean;
}

export default function PostsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [formData, setFormData] = useState<PostFormData>({
        title: "",
        content: "",
        published: false
    });

    const { data, loading, error, refetch } = useQuery<GetPostsResponse>(GET_POSTS, {
        variables: {
            data: {
                take: pageSize,
                skip: (currentPage - 1) * pageSize
            }
        },
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true
    });

    const [createPost, { loading: createLoading }] = useMutation<CreatePostResponse>(CREATE_POST);
    const [updatePost, { loading: updateLoading }] = useMutation<UpdatePostResponse>(UPDATE_POST);
    const [deletePost, { loading: deleteLoading }] = useMutation<DeletePostResponse>(DELETE_POST);

    useEffect(() => {
        refetch({
            data: {
                take: pageSize,
                skip: (currentPage - 1) * pageSize
            }
        });
    }, [currentPage, pageSize, refetch]);

    const posts = data?.getPosts?.data?.items || [];
    const totalPosts = data?.getPosts?.data?.count || 0;
    const totalPages = Math.ceil(totalPosts / pageSize);

    const filteredPosts = useMemo(() => {
        if (!searchTerm) return posts;
        return posts.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [posts, searchTerm]);

    const displayedPosts = searchTerm ? filteredPosts : posts;
    const actualTotalPages = searchTerm ? Math.ceil(filteredPosts.length / 10) : totalPages;

    useEffect(() => {
        if (currentPage > actualTotalPages && actualTotalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, actualTotalPages]);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await createPost({
                variables: {
                    data: {
                        ...formData,
                        authorId: 1, // TODO: Implement user selection
                    } as CreatePostDTO
                }
            });

            if (result.data?.createPost?.data?.items?.length) {
                setIsCreateModalOpen(false);
                setFormData({ title: "", content: "", published: false });
                setCurrentPage(1);
                refetch();
            } else {
                console.error("Unexpected response:", result);
            }
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const handleUpdatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPost) return;

        try {
            const result = await updatePost({
                variables: {
                    data: {
                        id: parseInt(selectedPost.id.toString()),
                        ...formData
                    } as UpdatePostDTO
                }
            });

            if (result.data?.updatePost?.data?.items?.length) {
                setIsEditModalOpen(false);
                setSelectedPost(null);
                setFormData({ title: "", content: "", published: false });
                refetch();
            } else {
                console.error("Unexpected response:", result);
            }
        } catch (error) {
            console.error("Error updating post:", error);
        }
    };

    const handleDeletePost = async () => {
        if (!selectedPost) return;

        try {
            const result = await deletePost({
                variables: {
                    data: {
                        id: parseInt(selectedPost.id.toString())
                    } as DeletePostDTO
                }
            });

            if (result.data?.deletePost?.data?.items?.length) {
                setIsDeleteModalOpen(false);
                setSelectedPost(null);
                if (displayedPosts.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
                refetch();
            } else {
                console.error("Unexpected response:", result);
            }
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const openEditModal = (post: Post) => {
        setSelectedPost(post);
        setFormData({
            title: post.title,
            content: post.content || "",
            published: post.published
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (post: Post) => {
        setSelectedPost(post);
        setIsDeleteModalOpen(true);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= actualTotalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
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
                    <h3 className="font-medium">Error loading posts</h3>
                    <p className="text-sm mt-1">{error.message}</p>
                    <button
                        onClick={() => { setCurrentPage(1); refetch(); }}
                        className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Posts</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Post
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center mb-4">
                    <Search className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedPosts.map(post => (
                                <tr key={post.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{post.title}</div>
                                        <div className="text-sm text-gray-500 truncate" style={{ maxWidth: '30ch' }}>{post.content}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(post.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(post)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit className="h-5 w-5" /></button>
                                        <button onClick={() => openDeleteModal(post)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
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

            {/* Create/Edit Modals */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">{isCreateModalOpen ? 'Create Post' : 'Edit Post'}</h2>
                        <form onSubmit={isCreateModalOpen ? handleCreatePost : handleUpdatePost}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" id="title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                                <textarea id="content" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows={4}></textarea>
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input type="checkbox" checked={formData.published} onChange={e => setFormData({ ...formData, published: e.target.checked })} className="rounded text-blue-500" />
                                    <span className="ml-2 text-sm text-gray-700">Published</span>
                                </label>
                            </div>
                            <div className="flex justify-end">
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600" disabled={createLoading || updateLoading}>
                                    {isCreateModalOpen ? (createLoading ? 'Creating...' : 'Create') : (updateLoading ? 'Saving...' : 'Save Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Delete Post</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete the post "{selectedPost.title}"? This action cannot be undone.</p>
                        <div className="flex justify-end">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                            <button onClick={handleDeletePost} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700" disabled={deleteLoading}>
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 