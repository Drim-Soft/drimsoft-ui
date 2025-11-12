'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Building2,
    Users,
    FolderOpen,
    Calendar,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    UserCog,
    Ticket
} from 'lucide-react';
import { useAuth } from './AuthProvider';

// Tipos definidos
interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ElementType;
    description: string;
}

//  Navegación según rol
const adminNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Panel principal' },
    { name: 'Organizaciones', href: '/organizations', icon: Building2, description: 'Gestionar organizaciones' },
    { name: 'Usuarios', href: '/users', icon: Users, description: 'Gestionar usuarios' },
    { name: 'Tickets', href: '/tickets', icon: Ticket, description: 'Solicitudes de soporte' },
    { name: 'Admins Planifika', href: '/planifika-admins', icon: Users, description: 'Administradores de organizaciones (Planifika)' }
];

const drimsoftNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Panel principal' },
    { name: 'Organizaciones', href: '/organizations', icon: Building2, description: 'Gestionar organizaciones' },
    { name: 'Tickets', href: '/tickets', icon: Ticket, description: 'Solicitudes de soporte' },
    { name: 'Admins Planifika', href: '/planifika-admins', icon: Users, description: 'Administradores de organizaciones (Planifika)' }
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    let roleId: number | null = null;
    let roleName = '';
    let navigationItems: NavigationItem[] = [];

    if (user && user.role && typeof user.role === 'object') {
        roleId = user.role.id;
        roleName = user.role.name || '';
    } else if (typeof window !== 'undefined') {
        const roleStr = localStorage.getItem('userRole');
        if (roleStr) {
            try {
                const roleObj = JSON.parse(roleStr);
                roleId = roleObj.id;
                roleName = roleObj.name || '';
            } catch {
                // Ignorar error si JSON está corrupto
            }
        }
    }

    if (roleId === 1) {
        roleName = 'Administrador';
        navigationItems = adminNavigation;
    } else if (roleId === 2) {
        roleName = 'Drimsoft Team';
        navigationItems = drimsoftNavigation;
    } else {
        navigationItems = [];
    }

    return (
        <div
            className={`bg-gradient-to-b from-[#222831] to-[#1a1f26] text-white transition-all duration-300 ${
                isCollapsed ? 'w-16' : 'w-64'
            } flex-shrink-0 h-screen flex flex-col shadow-2xl`}
        >
            {/* ---------------- Header ---------------- */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                            <Image
                                src="/assets/images/DrimSoft logo.png"
                                alt="DRIMSOFT Logo"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                        </div>
                        {!isCollapsed && (
                            <div>
                                <h1 className="text-xl font-bold text-[#FFD369]">DRIMSOFT</h1>
                                <p className="text-xs text-gray-400">Planifika</p>
                                {roleName && (
                                    <>
                                        <p className="text-xs text-[#FFD369] font-semibold mt-1">{roleName}</p>

                                        {/* 🔹 Botón Editar perfil */}
                                        <Link
                                            href="/edit-profile"
                                            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#FFD369] transition-colors mt-1"
                                        >
                                            <UserCog className="w-3.5 h-3.5" />
                                            <span>Editar perfil</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onToggle}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                {/* 🔹 Cuando está colapsado, mostrar solo el ícono de editar */}
                {isCollapsed && (
                    <div className="flex justify-center mt-2">
                        <Link
                            href="/edit-profile"
                            title="Editar perfil"
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <UserCog className="w-5 h-5 text-gray-400 hover:text-[#FFD369]" />
                        </Link>
                    </div>
                )}
            </div>

            {/* ---------------- Navigation ---------------- */}
            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                                        isActive
                                            ? 'bg-gradient-to-r from-[#FFD369] to-[#FFD369]/80 text-[#222831] shadow-lg'
                                            : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                                    }`}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <Icon
                                        className={`w-5 h-5 flex-shrink-0 ${
                                            isActive
                                                ? 'text-[#222831]'
                                                : 'text-gray-400 group-hover:text-[#FFD369]'
                                        }`}
                                    />
                                    {!isCollapsed && (
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs opacity-75">{item.description}</div>
                                        </div>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* ---------------- Footer ---------------- */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 p-3 w-full text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl transition-all duration-200 group"
                >
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                    {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
                </button>
            </div>
        </div>
    );
}
