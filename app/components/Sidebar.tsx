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
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Panel principal'
  },
  {
    name: 'Organizaciones',
    href: '/organizations',
    icon: Building2,
    description: 'Gestionar organizaciones'
  },
  {
    name: 'Usuarios',
    href: '/users',
    icon: Users,
    description: 'Gestionar usuarios'
  },
  {
    name: 'Proyectos',
    href: '/projects',
    icon: FolderOpen,
    description: 'Gestionar proyectos'
  },
  {
    name: 'Calendario',
    href: '/calendar',
    icon: Calendar,
    description: 'Vista de calendario'
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
    description: 'Configuración del sistema'
  }
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={`bg-gradient-to-b from-[#222831] to-[#1a1f26] text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen flex flex-col shadow-2xl fixed left-0 top-0 z-10`}>
      {/* Header */}
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
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
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-[#222831]' : 'text-gray-400 group-hover:text-[#FFD369]'
                  }`} />
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

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button className="flex items-center gap-3 p-3 w-full text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl transition-all duration-200 group">
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
          {!isCollapsed && (
            <span className="font-medium">Cerrar Sesión</span>
          )}
        </button>
      </div>
    </div>
  );
}
