'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth, AuthState } from '../../hooks/useAuth';

interface AuthContextType extends AuthState {
    autoLogin: () => Promise<{ token: any; user: any; }>;
    logout: () => void;
    retry: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const authState = useAuth();

    // Auto-login on app start
    useEffect(() => {
        if (!authState.user && !authState.loading) {
            authState.autoLogin().catch(console.error);
        }
    }, [authState.user, authState.loading, authState.autoLogin]);

    const contextValue: AuthContextType = {
        ...authState,
    };

    // Show loading while checking authentication
    if (authState.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Carregando...</div>
            </div>
        );
    }

    // Show error if authentication failed
    if (authState.error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">Erro de autenticação: {authState.error}</div>
                    <button
                        onClick={() => authState.autoLogin()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}; 