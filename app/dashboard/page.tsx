'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  FolderOpen, 
  TrendingUp,
  CheckCircle,
  BarChart3,
  Loader2
} from 'lucide-react';
import { organizationService } from '../services/organizationService';
import { userService } from '../services/userService';
import { ticketService } from '../services/ticketService';

interface Stat {
  name: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: typeof Building2;
  color: string;
}


interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface TicketStatusData {
  status: string;
  count: number;
  color: string;
}

// Función para formatear tiempo relativo
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Hace unos momentos';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
};


export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [ticketStatusData, setTicketStatusData] = useState<TicketStatusData[]>([]);
  const [ticketsByPriority, setTicketsByPriority] = useState<ChartData[]>([]);
  const [ticketsByStatusChart, setTicketsByStatusChart] = useState<ChartData[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo
      const [organizations, users, tickets] = await Promise.all([
        organizationService.getAllOrganizations().catch(() => []),
        userService.getAllUsers().catch(() => []),
        ticketService.getAllTickets().catch(() => [])
      ]);

      // Calcular estadísticas
      const organizationsCount = organizations.length;
      const usersCount = users.length;
      const ticketsCount = tickets.length;
      const completedTickets = tickets.filter((t: any) => 
        t.ticketstatusname?.toLowerCase().includes('resolved') || 
        t.ticketstatusname?.toLowerCase().includes('closed') ||
        t.ticketstatusname?.toLowerCase().includes('resuelto') ||
        t.ticketstatusname?.toLowerCase().includes('cerrado')
      ).length;

      const newStats: Stat[] = [
        {
          name: 'Organizaciones Activas',
          value: organizationsCount.toLocaleString(),
          icon: Building2,
          color: 'from-[#FFD369] to-[#FFD369]/80'
        },
        {
          name: 'Usuarios Totales',
          value: usersCount.toLocaleString(),
          icon: Users,
          color: 'from-blue-500 to-blue-400'
        },
        {
          name: 'Tickets Totales',
          value: ticketsCount.toLocaleString(),
          icon: FolderOpen,
          color: 'from-green-500 to-green-400'
        },
        {
          name: 'Tickets Resueltos',
          value: completedTickets.toLocaleString(),
          icon: CheckCircle,
          color: 'from-purple-500 to-purple-400'
        }
      ];

      setStats(newStats);

      // Calcular distribución de tickets por estado
      const statusCounts: Record<string, number> = {};
      tickets.forEach((ticket: any) => {
        const status = ticket.ticketstatusname || ticket.status || 'Sin estado';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const statusColors: Record<string, string> = {
        'open': '#3B82F6',
        'pending': '#F59E0B',
        'in_progress': '#8B5CF6',
        'progress': '#8B5CF6',
        'resolved': '#10B981',
        'closed': '#6B7280',
        'answered': '#10B981',
        'pendiente': '#F59E0B',
        'abierto': '#3B82F6',
        'en proceso': '#8B5CF6',
        'resuelto': '#10B981',
        'cerrado': '#6B7280',
        'respondido': '#10B981',
        'sin estado': '#9CA3AF'
      };

      const ticketStatusChart: TicketStatusData[] = Object.entries(statusCounts)
        .map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
          count,
          color: statusColors[status.toLowerCase()] || '#9CA3AF'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTicketStatusData(ticketStatusChart);

      // Calcular datos para gráfico circular de estados
      const totalTickets = tickets.length;
      const statusChartData: ChartData[] = Object.entries(statusCounts)
        .map(([status, count]) => ({
          label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
          value: count,
          color: statusColors[status.toLowerCase()] || '#9CA3AF',
          percentage: totalTickets > 0 ? (count / totalTickets) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      setTicketsByStatusChart(statusChartData);

      // Calcular distribución de tickets por prioridad (basado en estado y fecha)
      const priorityCounts = {
        high: 0,
        medium: 0,
        low: 0
      };

      tickets.forEach((ticket: any) => {
        const status = (ticket.ticketstatusname || '').toLowerCase();
        const dueDate = ticket.dueDate || ticket.deadline;
        
        if (status.includes('open') || status.includes('pending') || status.includes('pendiente')) {
          if (dueDate) {
            const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilDue <= 1) priorityCounts.high++;
            else if (daysUntilDue <= 3) priorityCounts.medium++;
            else priorityCounts.low++;
          } else {
            priorityCounts.medium++;
          }
        } else if (status.includes('progress') || status.includes('proceso')) {
          priorityCounts.high++;
        } else {
          priorityCounts.low++;
        }
      });

      const totalPriorityTickets = priorityCounts.high + priorityCounts.medium + priorityCounts.low;
      const priorityChart: ChartData[] = [
        {
          label: 'Alta',
          value: priorityCounts.high,
          color: '#EF4444',
          percentage: totalPriorityTickets > 0 ? (priorityCounts.high / totalPriorityTickets) * 100 : 0
        },
        {
          label: 'Media',
          value: priorityCounts.medium,
          color: '#F59E0B',
          percentage: totalPriorityTickets > 0 ? (priorityCounts.medium / totalPriorityTickets) * 100 : 0
        },
        {
          label: 'Baja',
          value: priorityCounts.low,
          color: '#10B981',
          percentage: totalPriorityTickets > 0 ? (priorityCounts.low / totalPriorityTickets) * 100 : 0
        }
      ].filter(item => item.value > 0);

      setTicketsByPriority(priorityChart);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFD369] mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

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

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-[#222831] mt-2">{stat.value}</p>
                    {stat.change && (
                      <p className={`text-sm mt-1 ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        {stat.change} vs mes anterior
                      </p>
                    )}
                  </div>
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Estadísticas y Gráficas */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Distribución de Tickets</h2>
            </div>
            
            {/* Gráfica de barras de estados de tickets */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Por Estado</h3>
              <div className="space-y-3">
                {ticketStatusData.length > 0 ? (
                  ticketStatusData.map((item, index) => {
                    const maxCount = Math.max(...ticketStatusData.map(d => d.count));
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 font-medium">{item.status}</span>
                          <span className="text-gray-600 font-semibold">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No hay datos disponibles</p>
                )}
              </div>
            </div>

            {/* Gráfica de prioridades */}
            {ticketsByPriority.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-4">Por Prioridad</h3>
                <div className="space-y-3">
                  {ticketsByPriority.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-700 font-medium">{item.label}</span>
                        </div>
                        <span className="text-gray-600 font-semibold">{item.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gráfico Circular de Estados */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Distribución de Tickets por Estado</h2>
            </div>
            {ticketsByStatusChart.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Gráfico Circular SVG */}
                <div className="flex-shrink-0">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                    {(() => {
                      let currentAngle = 0;
                      const radius = 80;
                      const centerX = 100;
                      const centerY = 100;
                      const total = ticketsByStatusChart.reduce((sum, item) => sum + item.value, 0);
                      
                      return ticketsByStatusChart.map((item, index) => {
                        const percentage = total > 0 ? item.value / total : 0;
                        const angle = percentage * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;
                        currentAngle += angle;

                        // Calcular puntos del arco
                        const startAngleRad = (startAngle * Math.PI) / 180;
                        const endAngleRad = (endAngle * Math.PI) / 180;
                        
                        const x1 = centerX + radius * Math.cos(startAngleRad);
                        const y1 = centerY + radius * Math.sin(startAngleRad);
                        const x2 = centerX + radius * Math.cos(endAngleRad);
                        const y2 = centerY + radius * Math.sin(endAngleRad);
                        
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        
                        const pathData = [
                          `M ${centerX} ${centerY}`,
                          `L ${x1} ${y1}`,
                          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          'Z'
                        ].join(' ');

                        return (
                          <path
                            key={index}
                            d={pathData}
                            fill={item.color}
                            stroke="white"
                            strokeWidth="2"
                            className="transition-all duration-500 hover:opacity-80"
                          />
                        );
                      });
                    })()}
                    {/* Círculo interno para efecto dona */}
                    <circle
                      cx="100"
                      cy="100"
                      r="50"
                      fill="white"
                    />
                    {/* Texto central */}
                    <text
                      x="100"
                      y="95"
                      textAnchor="middle"
                      className="fill-[#222831] text-2xl font-bold transform rotate-90"
                    >
                      {ticketsByStatusChart.reduce((sum, item) => sum + item.value, 0)}
                    </text>
                    <text
                      x="100"
                      y="110"
                      textAnchor="middle"
                      className="fill-gray-500 text-xs transform rotate-90"
                    >
                      Total
                    </text>
                  </svg>
                </div>
                
                {/* Leyenda */}
                <div className="flex-1 space-y-3">
                  {ticketsByStatusChart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                        <span className="text-xs text-gray-500 w-12 text-right">
                          ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No hay datos disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
