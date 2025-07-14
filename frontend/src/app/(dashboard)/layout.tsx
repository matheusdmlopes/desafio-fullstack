"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    Tag,
    Zap,
    User,
    BarChart3,
    Menu,
    X,
    LogOut,
    Database
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Usuários", href: "/dashboard/users", icon: Users },
    { name: "Posts", href: "/dashboard/posts", icon: FileText },
    { name: "Categorias", href: "/dashboard/categories", icon: Tag },
    { name: "Pokemon", href: "/dashboard/pokemon", icon: Zap },
    { name: "Perfis", href: "/dashboard/profiles", icon: User },
    { name: "Large Table", href: "/dashboard/large-table", icon: Database },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 }
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/");
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
                    <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-4">
                        <ul className="space-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
                    <div className="flex h-16 shrink-0 items-center">
                        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul className="flex flex-1 flex-col gap-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex flex-1 items-center">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {navigation.find(item => item.href === pathname)?.name || "Dashboard"}
                            </h2>
                        </div>
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            <div className="flex items-center gap-x-2">
                                <span className="text-sm text-gray-700">Olá, {user?.name}</span>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sair
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
} 