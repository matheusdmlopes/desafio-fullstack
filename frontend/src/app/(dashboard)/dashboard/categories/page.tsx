"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Tag,
    RefreshCw
} from "lucide-react";
import {
    GET_CATEGORIES,
    CREATE_CATEGORY,
    UPDATE_CATEGORY,
    DELETE_CATEGORY,
    type Category,
    type GetCategoriesResponse,
    type CreateCategoryResponse,
    type UpdateCategoryResponse,
    type DeleteCategoryResponse,
    type CreateCategoryDTO,
    type UpdateCategoryDTO,
    type DeleteCategoryDTO
} from "@/lib/queries/categories";

interface CategoryFormData {
    name: string;
}

export default function CategoriesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({ name: "" });

    const { data, loading, error, refetch } = useQuery<GetCategoriesResponse>(GET_CATEGORIES, {
        variables: {
            data: {
                take: pageSize,
                skip: (currentPage - 1) * pageSize
            }
        },
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all'
    });

    const [createCategory, { loading: createLoading }] = useMutation<CreateCategoryResponse>(CREATE_CATEGORY);
    const [updateCategory, { loading: updateLoading }] = useMutation<UpdateCategoryResponse>(UPDATE_CATEGORY);
    const [deleteCategory, { loading: deleteLoading }] = useMutation<DeleteCategoryResponse>(DELETE_CATEGORY);

    useEffect(() => {
        refetch({
            data: {
                take: pageSize,
                skip: (currentPage - 1) * pageSize
            }
        });
    }, [currentPage, pageSize, refetch]);

    const categories = data?.getCategorys?.data?.items || [];
    const totalCategories = data?.getCategorys?.data?.count || 0;
    const totalPages = Math.ceil(totalCategories / pageSize);

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;
        return categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const displayedCategories = searchTerm ? filteredCategories : categories;
    const actualTotalPages = searchTerm ? Math.ceil(filteredCategories.length / 10) : totalPages;

    useEffect(() => {
        if (currentPage > actualTotalPages && actualTotalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, actualTotalPages]);

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await createCategory({
                variables: { data: formData as CreateCategoryDTO }
            });

            if (result.data?.createCategory?.data?.items?.length) {
                setIsCreateModalOpen(false);
                setFormData({ name: "" });
                setCurrentPage(1);
                refetch();
            } else {
                console.error("Unexpected response:", result);
            }
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;

        try {
            const result = await updateCategory({
                variables: {
                    data: {
                        id: selectedCategory.id,
                        name: formData.name
                    } as UpdateCategoryDTO
                }
            });

            if (result.data?.updateCategory?.data?.items?.length) {
                setIsEditModalOpen(false);
                setSelectedCategory(null);
                setFormData({ name: "" });
                refetch();
            } else {
                console.error("Unexpected response:", result);
            }
        } catch (error) {
            console.error("Error updating category:", error);
        }
    };

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;

        try {
            const result = await deleteCategory({
                variables: {
                    data: {
                        id: selectedCategory.id
                    } as DeleteCategoryDTO
                }
            });

            if (result.data?.deleteCategory?.data?.items?.length) {
                setIsDeleteModalOpen(false);
                setSelectedCategory(null);
                if (displayedCategories.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
                refetch();
            } else {
                console.error("Unexpected response:", result);
            }
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setFormData({ name: category.name });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= actualTotalPages) {
            setCurrentPage(newPage);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="text-red-500 p-4">Error loading categories: {error.message}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Category
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center mb-4">
                    <Search className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedCategories.map(category => (
                                <tr key={category.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{category.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(category)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit className="h-5 w-5" /></button>
                                        <button onClick={() => openDeleteModal(category)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
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
                        <h2 className="text-2xl font-bold mb-6">{isCreateModalOpen ? 'Create Category' : 'Edit Category'}</h2>
                        <form onSubmit={isCreateModalOpen ? handleCreateCategory : handleUpdateCategory}>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
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

            {isDeleteModalOpen && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Delete Category</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete the category "{selectedCategory.name}"?</p>
                        <div className="flex justify-end">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                            <button onClick={handleDeleteCategory} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700" disabled={deleteLoading}>
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 