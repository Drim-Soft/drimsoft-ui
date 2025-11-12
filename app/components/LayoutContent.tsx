'use client';

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Sidebar from "./Sidebar";

interface LayoutContentProps {
  children: ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // Spinner mientras carga autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD369] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // 🔹 Login o usuario no autenticado
  if (isLoginPage || !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">
        {children}
      </main>
    );
  }

  // 🔹 Usuario autenticado (layout con sidebar)
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 h-full overflow-y-auto">{children}</main>
    </div>
  );
}
