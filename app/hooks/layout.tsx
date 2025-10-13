'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../services/authService';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();

  // Solo el login es público
  const publicRoutes = ['/login'];

  useEffect(() => {
    const isLoggedIn = authService.isAuthenticated();

    // Si no está autenticado e intenta entrar a una ruta privada
    if (!isLoggedIn && !publicRoutes.includes(pathname)) {
      router.replace('/login');
      return;
    }

    // Si ya está autenticado e intenta ir al login
    if (isLoggedIn && publicRoutes.includes(pathname)) {
      router.replace('/dashboard');
    }
  }, [pathname, router]);
}
