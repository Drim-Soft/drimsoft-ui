'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, PagedTicketsResponse } from '../types/ticket';
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar tickets paginados
  const loadTickets = async (page: number = currentPage, size: number = pageSize, search: string = searchTerm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        // Intentar usar endpoint paginado con el size solicitado (evita doble click)
        const pagedResponse: PagedTicketsResponse = await ticketService.getTicketsPaged(page, size, search);
        
        // Filtrar tickets según drimsoftUserId si está disponible
        let filtered = pagedResponse.items.filter((t: Ticket) => {
          if (!t.iddrimsoftuser) return true; 
          if (!drimsoftUserId) return false; 
          return t.iddrimsoftuser === drimsoftUserId; 
        });
        
        // Aplicar búsqueda en cliente si llega sin filtrar desde backend
        if (search && search.trim().length > 0) {
          const q = search.trim().toLowerCase();
          filtered = filtered.filter((t: Ticket) => {
            const title = t.title?.toLowerCase() || '';
            const desc = t.description?.toLowerCase() || '';
            // equals ignore case OR contains (contains ya cubre equals)
            return title.includes(q) || desc.includes(q);
          });
        }
        
        setTickets(filtered);
        setCurrentPage(pagedResponse.page);
        setTotalPages(pagedResponse.totalPages);
        setTotalElements(pagedResponse.totalElements);
        // Aseguramos que el estado pageSize refleje el usado realmente
        setPageSize(pagedResponse.size ?? size);
        setHasNext(pagedResponse.hasNext);
        setHasPrevious(pagedResponse.hasPrevious);
      } catch (paginationError) {
        console.warn('Endpoint paginado no disponible, usando endpoint sin paginación:', paginationError);
        if (paginationError instanceof Error && (paginationError.message === 'AUTH_401' || paginationError.message.includes('401'))) {
          router.push('/login');
          return;
        }
        
        // Fallback: usar endpoint sin paginación
        const allTickets = await ticketService.getAllTickets();
        let filtered = allTickets.filter((t: Ticket) => {
          if (!t.iddrimsoftuser) return true; 
          if (!drimsoftUserId) return false; 
          return t.iddrimsoftuser === drimsoftUserId; 
        });
        // Búsqueda local (case-insensitive contains)
        if (search && search.trim().length > 0) {
          const q = search.trim().toLowerCase();
          filtered = filtered.filter((t: Ticket) => {
            const title = t.title?.toLowerCase() || '';
            const desc = t.description?.toLowerCase() || '';
            return title.includes(q) || desc.includes(q);
          });
        }
        
        // Simular paginación en el cliente
        const start = page * size;
        const end = start + size;
        const paginatedTickets = filtered.slice(start, end);
        
        setTickets(paginatedTickets);
        setCurrentPage(page);
        setTotalElements(filtered.length);
        setTotalPages(Math.ceil(filtered.length / size));
        setHasNext(end < filtered.length);
        setHasPrevious(page > 0);
        setPageSize(size);
      }
    } catch (err) {
      console.error('Error al cargar tickets:', err);
      if (err instanceof Error && (err.message === 'AUTH_401' || err.message.includes('401'))) {
        router.push('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Error al cargar los tickets');
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones de navegación de página
  const handleNextPage = () => {
    if (hasNext) {
      loadTickets(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      loadTickets(currentPage - 1);
    }
  };

  const handleGoToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      loadTickets(page);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    // Reset a página 0 y carga inmediatamente con el nuevo size (sin necesitar segundo click)
    setCurrentPage(0);
    loadTickets(0, newSize);
  };

  // Debounce de búsqueda para evitar llamadas excesivas
  useEffect(() => {
    const handler = setTimeout(() => {
      // Reiniciar a primera página cuando cambie el término de búsqueda
      loadTickets(0, pageSize, searchTerm);
    }, 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

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
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
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
            <div className="flex w-full md:w-auto items-center gap-3">
              {/* Search Bar */}
              <div className="flex-1 md:flex-initial relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por título o descripción..."
                  className="w-full md:w-80 px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD369] focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Limpiar búsqueda"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                onClick={() => loadTickets(0, pageSize, searchTerm)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
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
        <TicketsTable 
          tickets={tickets} 
          onViewTicket={handleViewTicket}
          // Pagination props
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          onGoToPage={handleGoToPage}
          onPageSizeChange={handlePageSizeChange}
        />

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
