'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  updateProfile: (data: { name?: string; password?: string }) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status on mount and route changes
  useEffect(() => {
    checkAuthStatus();
  }, [pathname]);

    const checkAuthStatus = async () => {
        try {
            const authenticated = authService.isAuthenticated();
            setIsAuthenticated(authenticated);

            if (authenticated) {
                try {
                    const userData = await authService.getUser();

                    // Solo actualizar si aún no hay usuario cargado (o si cambió el id)
                    setUser((prev: any) => {
                        if (!prev || prev.id !== userData.id) {
                            return userData;
                        }
                        // Si ya hay user en contexto, no lo sobreescribas (evita revertir nombre)
                        return prev;
                    });
                } catch {
                    /* Silenciar error del getUser si el token caduca */
                }
            } else {
                setUser(null);
            }
        } catch {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };


    // Route protection logic
  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    const isLoginPage = pathname === '/login';
    const isPublicRoute = isLoginPage;

    if (!isAuthenticated && !isPublicRoute) {
      // Not authenticated and trying to access protected route
      router.replace('/login');
    } else if (isAuthenticated && isLoginPage) {
      // Authenticated and trying to access login page
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login(email, password);
      setIsAuthenticated(true);
      setUser(result.user);
      router.push('/dashboard');
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.replace('/login');
  };


    const updateProfile = async (data: { name?: string; password?: string }) => {
        try {
            const updatedUser = await authService.updateProfile(data);

            // 🔥 Actualiza inmediatamente el nombre visible sin depender de localStorage
            setUser((prev: any) => {
                if (!prev) return updatedUser.user?.db || updatedUser.db || updatedUser;

                const newName =
                    updatedUser?.name ||
                    updatedUser?.db?.name ||
                    updatedUser?.user?.db?.name ||
                    prev.name;

                return { ...prev, name: newName };
            });

            console.log('Nombre visualmente actualizado en contexto:', updatedUser);

            return updatedUser;
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            throw error;
        }
    };

    const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
