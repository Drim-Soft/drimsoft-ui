'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { userService } from '../services/userService';
import { useAuth } from '../components/AuthProvider';
import TicketsTable from '../components/TicketsTable';
import TicketDetailModal from '../components/TicketDetailModal';
import { Ticket as TicketIcon, RefreshCw, AlertCircle } from 'lucide-react';

export default function TicketsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drimsoftUserId, setDrimsoftUserId] = useState<number | null>(null);

  // Cargar tickets filtrados
  const loadTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ticketService.getAllTickets();
      const filtered = data.filter((t: Ticket) => {
        if (!t.iddrimsoftuser) return true; 
        if (!drimsoftUserId) return false; 
        return t.iddrimsoftuser === drimsoftUserId; 
      });
      setTickets(filtered);
    } catch (err) {
      console.error('Error al cargar tickets:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const resolveDrimsoftId = async () => {
      try {
        if (user?.id) {
          const u = await userService.getUserBySupabaseId(user.id);
          if (u?.idUser) {
            setDrimsoftUserId(u.idUser);
          }
        }
      } catch (e) {
        // Silencioso, la UI seguirá mostrando no asignados
      }
    };
    resolveDrimsoftId();
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadTickets();
      }
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadTickets();
    }
  }, [drimsoftUserId]);

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleTicketUpdate = () => {
    loadTickets();
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FFD369] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FFD369] rounded-xl">
                <TicketIcon className="w-8 h-8 text-[#222831]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tickets de Soporte</h1>
                <p className="text-gray-600 mt-1">
                  Gestión de solicitudes de soporte de usuarios
                </p>
              </div>
            </div>
            <button
              onClick={loadTickets}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-600">Total de Tickets</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{tickets.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-600">Pendientes</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {tickets.filter(t => t.ticketstatusname?.toLowerCase().includes('pending') || 
                                   t.ticketstatusname?.toLowerCase().includes('pendiente')).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-600">En Progreso</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">
              {tickets.filter(t => t.ticketstatusname?.toLowerCase().includes('progress') || 
                                   t.ticketstatusname?.toLowerCase().includes('proceso')).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-600">Respondidos</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">
              {tickets.filter(t => t.ticketstatusname?.toLowerCase().includes('answered') || 
                                   t.ticketstatusname?.toLowerCase().includes('respondido')).length}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Error al cargar tickets</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Tabla de tickets */}
        <TicketsTable tickets={tickets} onViewTicket={handleViewTicket} />

        {/* Modal de detalle */}
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleTicketUpdate}
        />
      </div>
    </div>
  );
}
