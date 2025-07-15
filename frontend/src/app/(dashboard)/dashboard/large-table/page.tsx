"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Search, Plus, Edit, Trash2, Database, RefreshCw } from "lucide-react";
import {
    GET_LARGE_TABLES,
    CREATE_LARGE_TABLE,
    UPDATE_LARGE_TABLE,
    DELETE_LARGE_TABLE,
    type LargeTable,
    type GetLargeTablesResponse,
    type CreateLargeTableResponse,
    type UpdateLargeTableResponse,
    type DeleteLargeTableResponse,
    type CreateLargeTableDTO,
    type UpdateLargeTableDTO,
    type DeleteLargeTableDTO,
} from "@/lib/queries/large-table";

interface LargeTableFormData {
    name: string;
    value: string;
    timestamp: string;
    details: string;
}

export default function LargeTablePage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<LargeTable | null>(null);
    const [formData, setFormData] = useState<LargeTableFormData>({
        name: "", value: "", timestamp: "", details: ""
    });

    const { data, loading, error, refetch } = useQuery<GetLargeTablesResponse>(GET_LARGE_TABLES, {
        variables: { data: { take: pageSize, skip: (currentPage - 1) * pageSize } },
        fetchPolicy: 'cache-and-network',
    });

    const [createItem, { loading: createLoading }] = useMutation<CreateLargeTableResponse>(CREATE_LARGE_TABLE);
    const [updateItem, { loading: updateLoading }] = useMutation<UpdateLargeTableResponse>(UPDATE_LARGE_TABLE);
    const [deleteItem, { loading: deleteLoading }] = useMutation<DeleteLargeTableResponse>(DELETE_LARGE_TABLE);

    const items = data?.getLargeTables.data.items || [];
    const totalItems = data?.getLargeTables.data.count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [items, searchTerm]);

    const formatDateTime = (isoString: string) => new Date(isoString).toLocaleString('pt-BR');
    const toInputDateTime = (isoString: string) => isoString ? new Date(isoString).toISOString().slice(0, 16) : "";

    const openModal = (item: LargeTable | null = null) => {
        setSelectedItem(item);
        setFormData(item ? { ...item, value: item.value.toString(), timestamp: toInputDateTime(item.timestamp) } : { name: "", value: "", timestamp: "", details: "" });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const variables = {
            data: {
                ...formData,
                value: parseFloat(formData.value),
                timestamp: new Date(formData.timestamp).toISOString(),
                ...(selectedItem ? { id: selectedItem.id } : {})
            }
        };

        try {
            if (selectedItem) {
                await updateItem({ variables });
            } else {
                await createItem({ variables });
            }
            setIsModalOpen(false);
            refetch();
        } catch (err) {
            console.error("Failed to save item:", err);
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            await deleteItem({ variables: { data: { id: selectedItem.id } } });
            setIsDeleteModalOpen(false);
            refetch();
        } catch (err) {
            console.error("Failed to delete item:", err);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="text-red-500 p-4">Error: {error.message}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Large Table</h1>
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between mb-4">
                    <input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border-gray-300 rounded-md shadow-sm" />
                    <button onClick={() => openModal()} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow">
                        <Plus className="h-5 w-5 mr-2" />
                        Create Item
                    </button>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">Name</th>
                            <th className="px-6 py-3 text-left">Value</th>
                            <th className="px-6 py-3 text-left">Timestamp</th>
                            <th className="px-6 py-3 text-left">Details</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredItems.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4">{item.name}</td>
                                <td className="px-6 py-4">{item.value}</td>
                                <td className="px-6 py-4">{formatDateTime(item.timestamp)}</td>
                                <td className="px-6 py-4 truncate" style={{ maxWidth: "200px" }}>{item.details}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openModal(item)} className="text-blue-600 mr-4"><Edit size={20} /></button>
                                    <button onClick={() => { setSelectedItem(item); setIsDeleteModalOpen(true); }} className="text-red-600"><Trash2 size={20} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-6">{selectedItem ? 'Edit Item' : 'Create Item'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="col-span-2 p-2 border rounded" required />
                                <input type="number" placeholder="Value" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="p-2 border rounded" required />
                                <input type="datetime-local" value={formData.timestamp} onChange={e => setFormData({ ...formData, timestamp: e.target.value })} className="p-2 border rounded" required />
                                <textarea placeholder="Details" value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })} className="col-span-2 p-2 border rounded" rows={3} required />
                            </div>
                            <div className="flex justify-end mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="mr-4 px-4 py-2 rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded-md" disabled={createLoading || updateLoading}>
                                    {selectedItem ? 'Save Changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Delete Item</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete "{selectedItem.name}"?</p>
                        <div className="flex justify-end">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="mr-4 px-4 py-2 rounded-md">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-white bg-red-600 rounded-md" disabled={deleteLoading}>
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 