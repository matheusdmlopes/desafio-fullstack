"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
    Search,
    Filter,
    BookOpen,
    Users,
    Tag,
    Calendar,
    TrendingUp,
    Eye,
    EyeOff
} from "lucide-react";
import PostCard from "@/components/posts/PostCard";
import {
    GET_POSTS,
    GET_CATEGORIES,
    GET_USERS,
    GetPostsResponse,
    GetCategoriesResponse,
    GetUsersResponse,
    Post,
    Author
} from "@/lib/queries/posts";

export default function PostsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Fetch posts
    const {
        data: postsData,
        loading: postsLoading,
        error: postsError
    } = useQuery<GetPostsResponse>(GET_POSTS, {
        variables: {
            data: {
                take: 100
            }
        }
    });

    // Fetch users (authors)
    const {
        data: usersData,
        loading: usersLoading
    } = useQuery<GetUsersResponse>(GET_USERS, {
        variables: {
            data: {
                take: 100
            }
        }
    });

    // Fetch categories
    const {
        data: categoriesData,
        loading: categoriesLoading
    } = useQuery<GetCategoriesResponse>(GET_CATEGORIES, {
        variables: {
            data: {
                take: 50
            }
        }
    });

    const rawPosts = postsData?.getPosts?.data?.items || [];
    const users = usersData?.getUsers?.data?.items || [];
    const categories = categoriesData?.getCategories?.data?.items || [];

    // Map posts with authors
    const posts: Post[] = useMemo(() => {
        return rawPosts.map(post => {
            const author = users.find(user => user.id === post.authorId);
            return {
                ...post,
                author: author || { id: post.authorId, name: 'Autor Desconhecido', email: '' },
                categories: [] // For now, since categories relationship isn't available
            };
        });
    }, [rawPosts, users]);

    // Filter posts
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesSearch = !searchTerm ||
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
                post.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = !selectedCategory ||
                post.categories?.some(pc => pc.category.id === selectedCategory);

            const matchesStatus = statusFilter === "all" ||
                (statusFilter === "published" && post.published) ||
                (statusFilter === "draft" && !post.published);

            return matchesSearch && matchesStatus; // Temporarily remove category filter
        });
    }, [posts, searchTerm, selectedCategory, statusFilter]);

    // Statistics
    const stats = useMemo(() => {
        const totalPosts = posts.length;
        const publishedPosts = posts.filter(p => p.published).length;
        const draftPosts = posts.filter(p => !p.published).length;
        const uniqueAuthors = new Set(posts.map(p => p.authorId)).size;

        return { totalPosts, publishedPosts, draftPosts, uniqueAuthors };
    }, [posts]);

    const isLoading = postsLoading || usersLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (postsError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar posts</h2>
                    <p className="text-gray-600">{postsError.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                                <BookOpen className="w-12 h-12" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Blog & Artigos
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Descubra artigos interessantes escritos por nossa comunidade de autores
                        </p>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <BookOpen className="w-5 h-5 text-blue-200" />
                                    <span className="text-2xl font-bold">{stats.totalPosts}</span>
                                </div>
                                <p className="text-blue-200 text-sm">Total de Posts</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Eye className="w-5 h-5 text-green-200" />
                                    <span className="text-2xl font-bold">{stats.publishedPosts}</span>
                                </div>
                                <p className="text-green-200 text-sm">Publicados</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <EyeOff className="w-5 h-5 text-yellow-200" />
                                    <span className="text-2xl font-bold">{stats.draftPosts}</span>
                                </div>
                                <p className="text-yellow-200 text-sm">Rascunhos</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Users className="w-5 h-5 text-purple-200" />
                                    <span className="text-2xl font-bold">{stats.uniqueAuthors}</span>
                                </div>
                                <p className="text-purple-200 text-sm">Autores</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por título, conteúdo ou autor..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="md:w-48">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">Todos os status</option>
                                    <option value="published">Publicados</option>
                                    <option value="draft">Rascunhos</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-gray-600">
                        Mostrando {filteredPosts.length} de {posts.length} posts
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Nenhum post encontrado
                        </h3>
                        <p className="text-gray-600">
                            Tente ajustar os filtros ou termos de busca
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 