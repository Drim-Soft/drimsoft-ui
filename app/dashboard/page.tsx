'use client';

import {
  AlertCircle,
  BarChart3,
  Building2,
  CheckCircle,
  DollarSign,
  FolderOpen,
  Ticket,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, Stats } from '../lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await api.getStats();
        setStats(data);
      } catch (err) {
        setError('Error al cargar las estadísticas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD369] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">{error || 'Error al cargar datos'}</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      name: 'Usuarios Planifika',
      value: stats.total_users_planifika.toLocaleString(),
      icon: Users,
      color: 'from-[#FFD369] to-[#FFD369]/80'
    },
    {
      name: 'Usuarios Drimsoft',
      value: stats.total_users_drimsoft.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-400'
    },
    {
      name: 'Proyectos Activos',
      value: stats.total_projects.toLocaleString(),
      icon: FolderOpen,
      color: 'from-green-500 to-green-400'
    },
    {
      name: 'Tareas Totales',
      value: stats.total_tasks.toLocaleString(),
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-400'
    },
    {
      name: 'Tickets',
      value: stats.total_tickets.toLocaleString(),
      icon: Ticket,
      color: 'from-orange-500 to-orange-400'
    },
    {
      name: 'Suscripciones',
      value: stats.total_subscriptions.toLocaleString(),
      icon: Building2,
      color: 'from-pink-500 to-pink-400'
    },
    {
      name: 'Ingresos Totales',
      value: `$${stats.total_revenue.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-400'
    }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-[#FFD369] to-[#FFD369]/80 rounded-xl">
              <BarChart3 className="w-6 h-6 text-[#222831]" />
            </div>
            <h1 className="text-3xl font-bold text-[#222831]">Dashboard</h1>
          </div>
          <p className="text-gray-600">Bienvenido a Planifika - Panel de control principal</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-[#222831] mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-[#222831] mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[#FFD369] hover:bg-[#FFD369]/5 transition-all duration-200 group">
              <Building2 className="w-5 h-5 text-gray-400 group-hover:text-[#FFD369]" />
              <span className="font-medium text-gray-700 group-hover:text-[#222831]">Nueva Organización</span>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[#FFD369] hover:bg-[#FFD369]/5 transition-all duration-200 group">
              <FolderOpen className="w-5 h-5 text-gray-400 group-hover:text-[#FFD369]" />
              <span className="font-medium text-gray-700 group-hover:text-[#222831]">Crear Proyecto</span>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[#FFD369] hover:bg-[#FFD369]/5 transition-all duration-200 group">
              <Users className="w-5 h-5 text-gray-400 group-hover:text-[#FFD369]" />
              <span className="font-medium text-gray-700 group-hover:text-[#222831]">Invitar Usuario</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}