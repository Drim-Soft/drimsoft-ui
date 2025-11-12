'use client';

import {
  Activity,
  AlertCircle,
  Award,
  BarChart3,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  FolderOpen,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Mock data basado en tu estructura real
const generateMockData = () => {
  // Usuarios por tipo (basado en idusertype)
  const usersByType = [
    { name: 'Admin', value: 8, color: '#FFD369' },
    { name: 'Profesores', value: 12, color: '#00ADB5' },
    { name: 'Estudiantes', value: 15, color: '#393E46' },
    { name: 'Super Admin', value: 1, color: '#9B59B6' }
  ];

  // Usuarios por estado
  const usersByStatus = [
    { name: 'Activos', value: 28, color: '#2ECC71' },
    { name: 'Inactivos', value: 5, color: '#E74C3C' },
    { name: 'Pendientes', value: 3, color: '#F39C12' }
  ];

  // Organizaciones registradas por mes (últimos 6 meses)
  const organizationGrowth = [
    { month: 'Jun', organizations: 15, users: 120, projects: 45 },
    { month: 'Jul', organizations: 18, users: 145, projects: 58 },
    { month: 'Ago', organizations: 22, users: 178, projects: 72 },
    { month: 'Sep', organizations: 26, users: 210, projects: 89 },
    { month: 'Oct', organizations: 30, users: 245, projects: 104 },
    { month: 'Nov', organizations: 36, users: 290, projects: 125 }
  ];

  // Tickets por estado (datos reales)
  const ticketsByStatus = [
    { status: 'Pendientes', count: 14, color: '#F39C12' },
    { status: 'Respondidos', count: 2, color: '#2ECC71' },
    { status: 'En Progreso', count: 1, color: '#3498DB' },
    { status: 'Cerrado', count: 1, color: '#95A5A6' }
  ];

  // Metodologías
  const methodologies = [
    { name: 'SCRUM', value: 42, color: '#00ADB5' },
    { name: 'PMBOK', value: 28, color: '#FFD369' },
    { name: 'Kanban', value: 18, color: '#393E46' },
    { name: 'XP', value: 12, color: '#9B59B6' },
    { name: 'Lean', value: 8, color: '#E74C3C' }
  ];

  // Usuarios por organización
  const usersByOrganization = [
    { organization: 'Universidad Javeriana', users: 45, color: '#FFD369' },
    { organization: 'DRIMSOFT', users: 38, color: '#00ADB5' },
    { organization: 'Colegio San Patricio', users: 32, color: '#393E46' },
    { organization: 'Universidad Nacional', users: 28, color: '#3498DB' },
    { organization: 'Institución XYZ', users: 22, color: '#9B59B6' }
  ];

  // Proyectos por estado
  const projectsByStatus = [
    { status: 'En Progreso', count: 68, color: '#3498DB' },
    { status: 'Completados', count: 42, color: '#2ECC71' },
    { status: 'Pendientes', count: 25, color: '#95A5A6' },
    { status: 'En Revisión', count: 21, color: '#9B59B6' }
  ];

  // Facturas por mes
  const invoicesByMonth = [
    { month: 'Jun', amount: 45000, invoices: 12 },
    { month: 'Jul', amount: 52000, invoices: 15 },
    { month: 'Ago', amount: 48000, invoices: 14 },
    { month: 'Sep', amount: 61000, invoices: 18 },
    { month: 'Oct', amount: 58000, invoices: 16 },
    { month: 'Nov', amount: 72000, invoices: 22 }
  ];

  // Suscripciones por tipo
  const subscriptionTypes = [
    { name: 'Básico', value: 12, color: '#95A5A6' },
    { name: 'Pro', value: 18, color: '#3498DB' },
    { name: 'Enterprise', value: 6, color: '#FFD369' }
  ];

  return {
    usersByType,
    usersByStatus,
    organizationGrowth,
    ticketsByStatus,
    projectsByStatus,
    invoicesByMonth,
    subscriptionTypes,
    methodologies,
    usersByOrganization
  };
};

const stats = [
  {
    name: 'Organizaciones Activas',
    value: '36',
    change: '+20%',
    changeType: 'positive',
    icon: Building2,
    color: 'from-[#FFD369] to-[#FFD369]/80',
    bgColor: 'bg-[#FFD369]/10'
  },
  {
    name: 'Usuarios Totales',
    value: '290',
    change: '+18%',
    changeType: 'positive',
    icon: Users,
    color: 'from-[#00ADB5] to-[#00ADB5]/80',
    bgColor: 'bg-[#00ADB5]/10'
  },
  {
    name: 'Proyectos Activos',
    value: '125',
    change: '+20%',
    changeType: 'positive',
    icon: FolderOpen,
    color: 'from-[#393E46] to-[#393E46]/80',
    bgColor: 'bg-[#393E46]/10'
  },
  {
    name: 'Ingresos del Mes',
    value: '$72K',
    change: '+24%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'from-green-500 to-green-400',
    bgColor: 'bg-green-500/10'
  }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-[#222831]">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState(generateMockData());
  const [hoveredStat, setHoveredStat] = useState(null);
  const [activeChart, setActiveChart] = useState(null);

  // Actualizar datos cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-[#FFD369] to-[#FFD369]/80 rounded-xl shadow-lg">
                  <BarChart3 className="w-6 h-6 text-[#222831]" />
                </div>
                <h1 className="text-3xl font-bold text-[#222831]">Dashboard Planifika</h1>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  En vivo
                </div>
              </div>
              <p className="text-gray-600">Panel de análisis y métricas</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isHovered = hoveredStat === index;
            
            return (
              <div 
                key={stat.name} 
                className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 cursor-pointer relative overflow-hidden
                  ${isHovered ? 'shadow-2xl -translate-y-2 border-2 border-[#FFD369]' : 'border-2 border-transparent'}`}
                onMouseEnter={() => setHoveredStat(index)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div className={`absolute inset-0 ${stat.bgColor} opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl transition-transform duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300 
                      ${stat.changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                      ${isHovered ? 'scale-110' : ''}`}>
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-4xl font-bold text-[#222831]">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Crecimiento Mensual - Líneas */}
          <div 
            className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 ${activeChart === 'growth' ? 'ring-2 ring-[#FFD369]' : ''}`}
            onMouseEnter={() => setActiveChart('growth')}
            onMouseLeave={() => setActiveChart(null)}
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Crecimiento Mensual</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.organizationGrowth}>
                <defs>
                  <linearGradient id="colorOrg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD369" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFD369" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ADB5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00ADB5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#393E46" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#393E46" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="organizations" stroke="#FFD369" fillOpacity={1} fill="url(#colorOrg)" name="Organizaciones" />
                <Area type="monotone" dataKey="users" stroke="#00ADB5" fillOpacity={1} fill="url(#colorUsers)" name="Usuarios" />
                <Area type="monotone" dataKey="projects" stroke="#393E46" fillOpacity={1} fill="url(#colorProjects)" name="Proyectos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Usuarios por Tipo - Pie Chart */}
          <div 
            className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 ${activeChart === 'userType' ? 'ring-2 ring-[#FFD369]' : ''}`}
            onMouseEnter={() => setActiveChart('userType')}
            onMouseLeave={() => setActiveChart(null)}
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Usuarios por Tipo</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={data.usersByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.usersByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Tickets por Estado - Bar Chart */}
          <div 
            className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 ${activeChart === 'tickets' ? 'ring-2 ring-[#FFD369]' : ''}`}
            onMouseEnter={() => setActiveChart('tickets')}
            onMouseLeave={() => setActiveChart(null)}
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Tickets por Estado</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.ticketsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="status" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Tickets" radius={[8, 8, 0, 0]}>
                  {data.ticketsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Proyectos por Estado - Pie Chart */}
          <div 
            className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 ${activeChart === 'projects' ? 'ring-2 ring-[#FFD369]' : ''}`}
            onMouseEnter={() => setActiveChart('projects')}
            onMouseLeave={() => setActiveChart(null)}
          >
            <div className="flex items-center gap-3 mb-6">
              <FolderOpen className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Proyectos por Estado</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={data.projectsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Ingresos Mensuales - Bar Chart */}
          <div 
            className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 ${activeChart === 'invoices' ? 'ring-2 ring-[#FFD369]' : ''}`}
            onMouseEnter={() => setActiveChart('invoices')}
            onMouseLeave={() => setActiveChart(null)}
          >
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Ingresos Mensuales</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.invoicesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="amount" fill="#2ECC71" name="Monto ($)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="invoices" fill="#FFD369" name="Facturas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Suscripciones - Donut Chart */}
          <div 
            className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 ${activeChart === 'subscriptions' ? 'ring-2 ring-[#FFD369]' : ''}`}
            onMouseEnter={() => setActiveChart('subscriptions')}
            onMouseLeave={() => setActiveChart(null)}
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Distribución de Suscripciones</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={data.subscriptionTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.subscriptionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Metodologías - Pie Chart */}
          <div 
            className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 ${activeChart === 'methodologies' ? 'ring-2 ring-[#FFD369]' : ''}`}
            onMouseEnter={() => setActiveChart('methodologies')}
            onMouseLeave={() => setActiveChart(null)}
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Metodologías Utilizadas</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={data.methodologies}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.methodologies.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Usuarios por Organización - Barras Horizontales */}
          <div 
            className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 ${activeChart === 'usersByOrg' ? 'ring-2 ring-[#FFD369]' : ''}`}
            onMouseEnter={() => setActiveChart('usersByOrg')}
            onMouseLeave={() => setActiveChart(null)}
          >
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-[#FFD369]" />
              <h2 className="text-xl font-semibold text-[#222831]">Usuarios por Organización</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.usersByOrganization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis dataKey="organization" type="category" stroke="#6B7280" width={150} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="users" name="Usuarios" radius={[0, 8, 8, 0]}>
                  {data.usersByOrganization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Usuarios por Estado */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-[#FFD369]" />
              <h3 className="text-lg font-semibold text-[#222831]">Estado de Usuarios</h3>
            </div>
            <div className="space-y-3">
              {data.usersByStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                    <span className="text-sm font-medium text-gray-700">{status.name}</span>
                  </div>
                  <span className="text-lg font-bold text-[#222831]">{status.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de Actividad */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-[#FFD369]" />
              <h3 className="text-lg font-semibold text-[#222831]">Actividad Reciente</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Proyectos esta semana</span>
                <span className="text-lg font-bold text-blue-600">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Tareas completadas</span>
                <span className="text-lg font-bold text-green-600">48</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-700">Nuevos usuarios</span>
                <span className="text-lg font-bold text-purple-600">8</span>
              </div>
            </div>
          </div>

          {/* Top Organizaciones */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-[#FFD369]" />
              <h3 className="text-lg font-semibold text-[#222831]">Top Organizaciones</h3>
            </div>
            <div className="space-y-3">
              {['Universidad Javeriana', 'DRIMSOFT', 'Colegio San Patricio'].map((org, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FFD369]/10 to-transparent rounded-lg hover:from-[#FFD369]/20 transition-colors duration-200">
                  <span className="text-sm font-medium text-gray-700">{org}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{15 - index * 3} proyectos</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}