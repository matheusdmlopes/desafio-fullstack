"use client";

import { useQuery } from "@apollo/client";
import { useState, useEffect, useMemo } from "react";
import {
    Users,
    FileText,
    Tag,
    Zap,
    User,
    Database,
    BarChart3,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import {
    GET_USERS_COUNT,
    GET_POSTS_COUNT,
    GET_CATEGORIES_COUNT,
    GET_POKEMON_COUNT,
    GET_PROFILES_COUNT,
    GET_LARGE_TABLE_COUNT,
    GET_RECENT_POSTS,
    GET_POSTS_STATS,
    type DashboardCounts,
    type RecentPost,
    type PostStats,
    type AnalyticsData
} from "@/lib/queries/dashboard";
import { apiRequest } from "@/lib/api";

export default function DashboardPage() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // Queries para buscar contagens
    const { data: usersData, loading: usersLoading } = useQuery(GET_USERS_COUNT);
    const { data: postsData, loading: postsLoading } = useQuery(GET_POSTS_COUNT);
    const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES_COUNT);
    const { data: pokemonData, loading: pokemonLoading } = useQuery(GET_POKEMON_COUNT);
    const { data: profilesData, loading: profilesLoading } = useQuery(GET_PROFILES_COUNT);
    const { data: largeTableData, loading: largeTableLoading } = useQuery(GET_LARGE_TABLE_COUNT);

    // Queries para dados adicionais
    const { data: recentPostsData, loading: recentPostsLoading } = useQuery(GET_RECENT_POSTS);
    const { data: postsStatsData, loading: postsStatsLoading } = useQuery(GET_POSTS_STATS);

    // Buscar dados de analytics via REST API
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setAnalyticsLoading(true);
                const data = await apiRequest('http://localhost:3000/analytics');
                setAnalyticsData(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                setAnalyticsData(null);
            } finally {
                setAnalyticsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    // Preparar dados das contagens
    const counts: DashboardCounts = useMemo(() => ({
        users: usersData?.getUsers?.data?.count || 0,
        posts: postsData?.getPosts?.data?.count || 0,
        categories: categoriesData?.getCategories?.data?.count || 0,
        pokemon: pokemonData?.getPokemons?.data?.count || 0,
        profiles: profilesData?.getProfiles?.data?.count || 0,
        largeTables: largeTableData?.getLargeTables?.data?.count || 0
    }), [usersData, postsData, categoriesData, pokemonData, profilesData, largeTableData]);

    // Preparar estatísticas de posts
    const postStats: PostStats = useMemo(() => {
        const items = postsStatsData?.getPosts?.data?.items || [];
        const total = items.length;
        const published = items.filter((post: any) => post.published).length;
        const draft = total - published;

        // Posts dos últimos 7 dias
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCount = items.filter((post: any) =>
            new Date(post.createdAt) >= sevenDaysAgo
        ).length;

        return { total, published, draft, recentCount };
    }, [postsStatsData]);

    // Posts recentes
    const recentPosts: RecentPost[] = useMemo(() => {
        return recentPostsData?.getPosts?.data?.items || [];
    }, [recentPostsData]);

    // Estatísticas de usuários do analytics
    const userStats = useMemo(() => {
        if (!analyticsData?.data) return null;

        const users = analyticsData.data;
        const total = users.length;
        const classifications = users.reduce((acc, user) => {
            acc[user.user_classification] = (acc[user.user_classification] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const activityStatus = users.reduce((acc, user) => {
            acc[user.activity_status] = (acc[user.activity_status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { total, classifications, activityStatus };
    }, [analyticsData]);

    const isLoading = usersLoading || postsLoading || categoriesLoading ||
        pokemonLoading || profilesLoading || largeTableLoading;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Visão geral dos dados do sistema</p>
            </div>

            {/* Cards principais de contagem */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Usuários"
                    value={counts.users}
                    icon={Users}
                    color="blue"
                    loading={usersLoading}
                    description="Total de usuários cadastrados"
                    href="/dashboard/users"
                />
                <StatsCard
                    title="Posts"
                    value={counts.posts}
                    icon={FileText}
                    color="green"
                    loading={postsLoading}
                    description="Total de posts criados"
                    href="/dashboard/posts"
                />
                <StatsCard
                    title="Categorias"
                    value={counts.categories}
                    icon={Tag}
                    color="purple"
                    loading={categoriesLoading}
                    description="Categorias disponíveis"
                    href="/dashboard/categories"
                />
                <StatsCard
                    title="Pokemon"
                    value={counts.pokemon}
                    icon={Zap}
                    color="yellow"
                    loading={pokemonLoading}
                    description="Pokemon cadastrados"
                    href="/dashboard/pokemon"
                />
                <StatsCard
                    title="Perfis"
                    value={counts.profiles}
                    icon={User}
                    color="indigo"
                    loading={profilesLoading}
                    description="Perfis de usuários"
                    href="/dashboard/profiles"
                />
                <StatsCard
                    title="Large Table"
                    value={counts.largeTables}
                    icon={Database}
                    color="gray"
                    loading={largeTableLoading}
                    description="Registros para analytics"
                    href="/dashboard/large-table"
                />
            </div>

            {/* Estatísticas de posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Posts Publicados"
                    value={postStats.published}
                    icon={CheckCircle}
                    color="green"
                    loading={postsStatsLoading}
                    description="Posts disponíveis publicamente"
                />
                <StatsCard
                    title="Rascunhos"
                    value={postStats.draft}
                    icon={AlertCircle}
                    color="yellow"
                    loading={postsStatsLoading}
                    description="Posts não publicados"
                />
                <StatsCard
                    title="Posts Recentes"
                    value={postStats.recentCount}
                    icon={Clock}
                    color="blue"
                    loading={postsStatsLoading}
                    description="Últimos 7 dias"
                />
                <StatsCard
                    title="Taxa de Publicação"
                    value={`${postStats.total > 0 ? Math.round((postStats.published / postStats.total) * 100) : 0}%`}
                    icon={TrendingUp}
                    color="purple"
                    loading={postsStatsLoading}
                    description="Posts publicados vs total"
                />
            </div>

            {/* Análise de usuários */}
            {userStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatsCard
                        title="Usuários Ativos"
                        value={userStats.activityStatus.highly_active || 0}
                        icon={TrendingUp}
                        color="green"
                        loading={analyticsLoading}
                        description="Muito ativos recentemente"
                    />
                    <StatsCard
                        title="Power Users"
                        value={userStats.classifications.power_user || 0}
                        icon={BarChart3}
                        color="purple"
                        loading={analyticsLoading}
                        description="Usuários com alta participação"
                    />
                    <StatsCard
                        title="Novos Usuários"
                        value={userStats.classifications.new_user || 0}
                        icon={Users}
                        color="blue"
                        loading={analyticsLoading}
                        description="Usuários recentes"
                    />
                </div>
            )}

            {/* Posts recentes */}
            {recentPosts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Posts Recentes</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recentPosts.map((post) => (
                            <div key={post.id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-900">{post.title}</h4>
                                        <p className="text-sm text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {post.published ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Publicado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Rascunho
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200">
                        <a
                            href="/dashboard/posts"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Ver todos os posts →
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
} 