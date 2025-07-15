"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";
import {
    Users,
    FileText,
    Tag,
    Zap,
    User,
    Database
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import {
    GET_USERS_COUNT,
    GET_POSTS_COUNT,
    GET_CATEGORIES_COUNT,
    GET_POKEMON_COUNT,
    GET_PROFILES_COUNT,
    GET_LARGE_TABLE_COUNT,
    type DashboardCounts
} from "@/lib/queries/dashboard";

export default function DashboardPage() {
    // Queries para buscar contagens
    const { data: usersData, loading: usersLoading } = useQuery(GET_USERS_COUNT);
    const { data: postsData, loading: postsLoading } = useQuery(GET_POSTS_COUNT);
    const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES_COUNT);
    const { data: pokemonData, loading: pokemonLoading } = useQuery(GET_POKEMON_COUNT);
    const { data: profilesData, loading: profilesLoading } = useQuery(GET_PROFILES_COUNT);
    const { data: largeTableData, loading: largeTableLoading } = useQuery(GET_LARGE_TABLE_COUNT);

    // Preparar dados das contagens
    const counts: DashboardCounts = useMemo(() => ({
        users: usersData?.getUsers?.data?.count || 0,
        posts: postsData?.getPosts?.data?.count || 0,
        categories: categoriesData?.getCategorys?.data?.count || 0,
        pokemon: pokemonData?.getPokemons?.data?.count || 0,
        profiles: profilesData?.getProfiles?.data?.count || 0,
        largeTables: largeTableData?.getLargeTables?.data?.count || 0
    }), [usersData, postsData, categoriesData, pokemonData, profilesData, largeTableData]);

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
        </div>
    );
} 