"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Zap, Users, FileText, Shield } from "lucide-react";
import { clsx } from "clsx";

const navigation = [
    { name: "Pokemon", href: "/pokemons", icon: Zap },
    { name: "Blog", href: "/blog", icon: FileText },
];

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href || pathname.startsWith(href);

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Home */}
                    <div className="flex items-center">
                        <Link
                            href="/"
                            className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                            <Home className="h-6 w-6" />
                            <span>Fullstack Challenge</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                        isActive(item.href)
                                            ? "text-blue-600 bg-blue-50"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Admin/Login Link */}
                    <div className="hidden md:flex items-center">
                        <Link
                            href="/login"
                            className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Shield className="h-4 w-4" />
                            <span>Admin</span>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 p-2"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="space-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={clsx(
                                            "flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors",
                                            isActive(item.href)
                                                ? "text-blue-600 bg-blue-50"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-2 px-3 py-2 mt-4 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <Shield className="h-5 w-5" />
                                <span>Admin</span>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
} 