"use client";

import { useState, useEffect } from 'react';

interface User {
    id: number;
    email: string;
    name: string;
}

export interface AuthState {
    token: string | null;
    user: User | null;
    loading: boolean;
    error: string | null;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        token: null,
        user: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        // Check for existing token on mount
        const existingToken = localStorage.getItem('auth_token');
        const existingUser = localStorage.getItem('auth_user');

        if (existingToken && existingUser) {
            try {
                const user = JSON.parse(existingUser);
                setAuthState({
                    token: existingToken,
                    user,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                // Clear invalid data and trigger auto-login
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                autoLogin();
            }
        } else {
            // No existing auth data, trigger auto-login
            autoLogin();
        }
    }, []);

    const autoLogin = async () => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));

            const response = await fetch('http://localhost:3000/auth/auto-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Auto-login failed: ${response.status}`);
            }

            const { token, user } = await response.json();

            // Store in localStorage
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));

            setAuthState({
                token,
                user,
                loading: false,
                error: null,
            });

            return { token, user };
        } catch (error) {
            console.error('Auto-login error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Auto-login failed';

            setAuthState({
                token: null,
                user: null,
                loading: false,
                error: errorMessage,
            });

            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setAuthState({
            token: null,
            user: null,
            loading: false,
            error: null,
        });
    };

    const retry = () => {
        autoLogin();
    };

    return {
        token: authState.token,
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        autoLogin,
        logout,
        retry,
        isAuthenticated: !!authState.token && !!authState.user,
    };
} 