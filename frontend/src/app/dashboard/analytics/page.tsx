"use client";

import { useState, useEffect } from "react";
import {
    BarChart3,
    Users,
    TrendingUp,
    Activity,
    AlertCircle,
    RefreshCw,
    Star,
    Zap
} from "lucide-react";

interface AnalyticsRecord {
    user_id: string | number;
    email: string;
    user_name: string;
    user_created: string;
    user_age_days: number;
    email_domain_type: string;
    profile_status: string;
    bio_length: number;
    total_posts: number;
    published_posts: number;
    avg_content_length: number;
    last_post_date: string | null;
    unique_categories_used: number;
    total_category_assignments: number;
    category_diversity_percentage: number;
    user_classification: string;
    activity_status: string;
    engagement_score: number;
    analysis_generated_at: string;
    system_data_points: number;
}

interface AnalyticsResponse {
    success: boolean;
    timestamp: string;
    recordCount: number;
    data: AnalyticsRecord[];
    message: string;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get token from localStorage
            const token = localStorage.getItem('auth_token');

            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }

            const response = await fetch('http://localhost:3000/analytics', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const result: AnalyticsResponse = await response.json();

            if (result.success && result.data) {
                // Ensure all numeric fields are properly converted
                const cleanedData = result.data.map(record => ({
                    ...record,
                    user_id: String(record.user_id),
                    bio_length: Number(record.bio_length) || 0,
                    total_posts: Number(record.total_posts) || 0,
                    published_posts: Number(record.published_posts) || 0,
                    unique_categories_used: Number(record.unique_categories_used) || 0,
                    total_category_assignments: Number(record.total_category_assignments) || 0,
                    engagement_score: Number(record.engagement_score) || 0,
                    system_data_points: Number(record.system_data_points) || 0,
                }));

                setData(cleanedData);
            } else {
                throw new Error(result.message || 'Dados de analytics não disponíveis');
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const getClassificationColor = (classification: string): string => {
        const colors: Record<string, string> = {
            power_user: "bg-purple-100 text-purple-800",
            active_user: "bg-green-100 text-green-800",
            contributor: "bg-blue-100 text-blue-800",
            new_user: "bg-yellow-100 text-yellow-800",
            inactive_user: "bg-gray-100 text-gray-800"
        };
        return colors[classification] || "bg-gray-100 text-gray-800";
    };

    const getActivityColor = (activity: string): string => {
        const colors: Record<string, string> = {
            highly_active: "bg-green-100 text-green-800",
            moderately_active: "bg-blue-100 text-blue-800",
            occasionally_active: "bg-yellow-100 text-yellow-800",
            dormant: "bg-orange-100 text-orange-800",
            no_activity: "bg-gray-100 text-gray-800"
        };
        return colors[activity] || "bg-gray-100 text-gray-800";
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'Nunca';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'Data inválida';
        }
    };

    // Calculate metrics
    const metrics = {
        totalUsers: data.length,
        totalPosts: data.reduce((sum, r) => sum + r.total_posts, 0),
        totalPublishedPosts: data.reduce((sum, r) => sum + r.published_posts, 0),
        avgEngagement: data.length > 0 ?
            Math.round((data.reduce((sum, r) => sum + r.engagement_score, 0) / data.length) * 100) / 100 : 0
    };

    // Get classifications distribution
    const classifications = data.reduce((acc, r) => {
        acc[r.user_classification] = (acc[r.user_classification] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Get activity status distribution  
    const activityStatus = data.reduce((acc, r) => {
        acc[r.activity_status] = (acc[r.activity_status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Top users by engagement
    const topUsers = [...data]
        .sort((a, b) => b.engagement_score - a.engagement_score)
        .slice(0, 5);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-lg text-gray-600">Carregando analytics...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
                            <div>
                                <h3 className="text-lg font-medium text-red-800">Erro ao carregar analytics</h3>
                                <p className="text-red-600 mt-1">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchAnalytics}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                    Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                    Análise detalhada do engajamento e comportamento dos usuários
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total de Posts</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics.totalPosts}</p>
                            <p className="text-sm text-gray-500">{metrics.totalPublishedPosts} publicados</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Engajamento Médio</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics.avgEngagement}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <Activity className="h-8 w-8 text-orange-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pontos de Dados</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data[0]?.system_data_points || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Classifications */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 mr-2" />
                        Classificação de Usuários
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(classifications).map(([classification, count]) => (
                            <div key={classification} className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getClassificationColor(classification)}`}>
                                    {classification.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Activity className="h-5 w-5 text-green-500 mr-2" />
                        Status de Atividade
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(activityStatus).map(([activity, count]) => (
                            <div key={activity} className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActivityColor(activity)}`}>
                                    {activity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Users */}
            {topUsers.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                        Top 5 Usuários por Engajamento
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Posts
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Categorias
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Classificação
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Score
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {topUsers.map((user, index) => (
                                    <tr key={user.user_id} className={index < 3 ? "bg-yellow-50" : ""}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-blue-600">
                                                        {user.user_name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.user_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.total_posts} ({user.published_posts} pub.)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.unique_categories_used}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(user.user_classification)}`}>
                                                {user.user_classification.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.engagement_score.toFixed(1)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* All Users Data */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                    Todos os Usuários ({data.length} registros)
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Posts (Rascunho)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Classificação
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Atividade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Último Post
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.slice(0, 15).map((record) => (
                                <tr key={record.user_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-xs font-medium text-blue-600">
                                                    {record.user_name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {record.user_name}
                                                </div>
                                                <div className="text-sm text-gray-500">{record.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.total_posts} ({record.published_posts})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(record.user_classification)}`}>
                                            {record.user_classification.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(record.activity_status)}`}>
                                            {record.activity_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {record.engagement_score.toFixed(1)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(record.last_post_date)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data.length > 15 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Mostrando 15 de {data.length} registros
                    </div>
                )}
            </div>
        </div>
    );
} 