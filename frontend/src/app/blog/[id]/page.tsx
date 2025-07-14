"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import {
    ArrowLeft,
    Calendar,
    User,
    Tag,
    Eye,
    EyeOff,
    BookOpen,
    Clock
} from "lucide-react";
import {
    GET_USERS,
    GetUsersResponse,
    Post,
    Author
} from "@/lib/queries/posts";
import { apiRequest, API_BASE_URL } from "@/lib/api";
import { useMemo, useEffect, useState } from "react";

export default function PostPage() {
    const params = useParams();
    const router = useRouter();
    const postId = parseInt(params.id as string, 10);

    // State for REST API post fetch
    const [rawPost, setRawPost] = useState<any>(null);
    const [postLoading, setPostLoading] = useState(true);
    const [postError, setPostError] = useState<string | null>(null);

    // Fetch users to get author info via GraphQL
    const { data: usersData, loading: usersLoading } = useQuery<GetUsersResponse>(GET_USERS, {
        variables: {
            data: { take: 100 }
        }
    });

    // Fetch post by ID using REST API for optimal performance
    useEffect(() => {
        if (isNaN(postId)) return;

        setPostLoading(true);
        setPostError(null);


        apiRequest(`${API_BASE_URL}/posts/${postId}`)
            .then(data => {
                if (data.error) {
                    throw new Error(data.error.notFound || data.error.badRequest || 'Erro desconhecido');
                }
                // REST API returns data.data.items[0]
                const post = data.data?.items?.[0];
                setRawPost(post || null);
            })
            .catch(error => {
                console.error('Error fetching post:', error);
                setPostError(error.message);
                setRawPost(null);
            })
            .finally(() => {
                setPostLoading(false);
            });
    }, [postId]);

    const users = usersData?.getUsers?.data?.items || [];

    // Map post with author
    const post: Post | null = useMemo(() => {
        if (!rawPost) return null;

        const author = users.find(user => user.id === rawPost.authorId);
        return {
            ...rawPost,
            author: author || { id: rawPost.authorId, name: 'Autor Desconhecido', email: '' },
            categories: [] // For now, since categories relationship isn't available
        };
    }, [rawPost, users]);

    const isLoading = postLoading || usersLoading;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatReadingTime = (content: string | null) => {
        if (!content) return "1 min";
        const wordsPerMinute = 200;
        const wordCount = content.split(' ').length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);
        return `${readingTime} min`;
    };

    if (isNaN(postId)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Post não encontrado</h2>
                    <p className="text-gray-600 mb-6">O ID do post não é válido.</p>
                    <button
                        onClick={() => router.push('/blog')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Blog
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Navigation Bar */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <button
                            onClick={() => router.push('/blog')}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Blog
                        </button>
                    </div>
                </div>

                {/* Loading Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                        <div className="space-y-3">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (postError || !post) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Post não encontrado</h2>
                    <p className="text-gray-600 mb-6">
                        {postError || 'O post solicitado não existe ou foi removido.'}
                    </p>
                    <button
                        onClick={() => router.push('/blog')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Blog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation Bar */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => router.push('/blog')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Blog
                    </button>
                </div>
            </div>

            {/* Post Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Post Header */}
                <header className="mb-8">
                    {/* Status and Reading Time */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            {post.published ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                    <Eye className="w-4 h-4" />
                                    Publicado
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                                    <EyeOff className="w-4 h-4" />
                                    Rascunho
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                {formatReadingTime(post.content)} de leitura
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                        {post.title}
                    </h1>

                    {/* Meta Information */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600 border-b border-gray-200 pb-6">
                        {/* Author */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {post.author?.name || 'Autor Anônimo'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {post.author?.email || 'Email não disponível'}
                                </p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>Publicado em {formatDate(post.createdAt)}</span>
                        </div>
                    </div>
                </header>

                {/* Post Content */}
                <div className="prose prose-lg max-w-none">
                    {post.content ? (
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Este post não possui conteúdo.</p>
                        </div>
                    )}
                </div>

                {/* Post Footer */}
                <footer className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Última atualização: {formatDate(post.updatedAt)}
                        </div>
                        <button
                            onClick={() => router.push('/blog')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Blog
                        </button>
                    </div>
                </footer>
            </article>
        </div>
    );
} 