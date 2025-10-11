'use client';

import { 
  Building2, 
  Users, 
  FolderOpen, 
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';

const stats = [
  {
    name: 'Organizaciones Activas',
    value: '24',
    change: '+12%',
    changeType: 'positive',
    icon: Building2,
    color: 'from-[#FFD369] to-[#FFD369]/80'
  },
  {
    name: 'Usuarios Totales',
    value: '1,847',
    change: '+8%',
    changeType: 'positive',
    icon: Users,
    color: 'from-blue-500 to-blue-400'
  },
  {
    name: 'Proyectos Activos',
    value: '156',
    change: '+23%',
    changeType: 'positive',
    icon: FolderOpen,
    color: 'from-green-500 to-green-400'
  },
  {
    name: 'Tareas Completadas',
    value: '2,341',
    change: '+15%',
    changeType: 'positive',
    icon: CheckCircle,
    color: 'from-purple-500 to-purple-400'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'organization',
    message: 'Nueva organización "Universidad Nacional" registrada',
    time: 'Hace 2 horas',
    icon: Building2,
    color: 'text-[#FFD369]'
  },
  {
    id: 2,
    type: 'project',
    message: 'Proyecto "Sistema Académico" completado',
    time: 'Hace 4 horas',
    icon: CheckCircle,
    color: 'text-green-500'
  },
  {
    id: 3,
    type: 'user',
    message: '15 nuevos usuarios registrados hoy',
    time: 'Hace 6 horas',
    icon: Users,
    color: 'text-blue-500'
  },
  {
    id: 4,
    type: 'alert',
    message: '3 proyectos próximos a vencer',
    time: 'Hace 8 horas',
    icon: AlertCircle,
    color: 'text-orange-500'
  }
];

const upcomingTasks = [
  {
    id: 1,
    title: 'Revisar propuesta Universidad Javeriana',
    dueDate: 'Hoy',
    priority: 'high',
    organization: 'Universidad Javeriana'
  },
  {
    id: 2,
    title: 'Actualizar documentación API',
    dueDate: 'Mañana',
    priority: 'medium',
    organization: 'DRIMSOFT'
  },
  {
    id: 3,
    title: 'Reunión con Colegio San Patricio',
    dueDate: 'En 2 días',
    priority: 'high',
    organization: 'Colegio San Patricio'
  },
  {
    id: 4,
    title: 'Implementar nuevas funcionalidades',
    dueDate: 'En 3 días',
    priority: 'low',
    organization: 'DRIMSOFT'
  }
];

export default function DashboardPage() {
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
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-[#222831] mt-2">{stat.value}</p>
                    <p className={`text-sm mt-1 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      {stat.change} vs mes anterior
                    </p>
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
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Actividad Reciente</h2>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <div className={`p-2 bg-gray-100 rounded-lg`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Tareas Próximas</h2>
            </div>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:border-[#FFD369] transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#222831]">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.organization}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                        <span className="text-xs text-gray-500">{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
