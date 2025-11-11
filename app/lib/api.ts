// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Stats {
  total_users_planifika: number;
  total_users_drimsoft: number;
  total_projects: number;
  total_tasks: number;
  total_tickets: number;
  total_subscriptions: number;
  total_revenue: number;
}

export interface ChartData {
  data: any[];
  layout: any;
}

export const api = {
  // Obtener estadísticas generales
  async getStats(): Promise<Stats> {
    const response = await fetch(`${API_URL}/api/stats`);
    if (!response.ok) throw new Error('Error fetching stats');
    return response.json();
  },

  // Obtener gráfico de proyectos por estado
  async getProjectsStatus(): Promise<ChartData> {
    const response = await fetch(`${API_URL}/api/charts/projects-status`);
    if (!response.ok) throw new Error('Error fetching projects status');
    return response.json();
  },

  // Obtener gráfico de tareas por estado
  async getTasksStatus(): Promise<ChartData> {
    const response = await fetch(`${API_URL}/api/charts/tasks-status`);
    if (!response.ok) throw new Error('Error fetching tasks status');
    return response.json();
  },

  // Obtener gráfico de tickets por estado
  async getTicketsStatus(): Promise<ChartData> {
    const response = await fetch(`${API_URL}/api/charts/tickets-status`);
    if (!response.ok) throw new Error('Error fetching tickets status');
    return response.json();
  },

  // Obtener distribución de metodologías
  async getMethodologyDistribution(): Promise<ChartData> {
    const response = await fetch(`${API_URL}/api/charts/methodology-distribution`);
    if (!response.ok) throw new Error('Error fetching methodology distribution');
    return response.json();
  },

  // Obtener línea de tiempo de ingresos
  async getRevenueTimeline(): Promise<ChartData> {
    const response = await fetch(`${API_URL}/api/charts/revenue-timeline`);
    if (!response.ok) throw new Error('Error fetching revenue timeline');
    return response.json();
  },

  // Obtener suscripciones por estado
  async getSubscriptionsStatus(): Promise<ChartData> {
    const response = await fetch(`${API_URL}/api/charts/subscriptions-status`);
    if (!response.ok) throw new Error('Error fetching subscriptions status');
    return response.json();
  }
};