'use client';

import { useState } from 'react';
import { Ticket } from '../types/ticket';
import { Eye, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface TicketsTableProps {
  tickets: Ticket[];
  onViewTicket?: (ticket: Ticket) => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onGoToPage?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export default function TicketsTable({ 
  tickets, 
  onViewTicket,
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  hasNext = false,
  hasPrevious = false,
  onNextPage,
  onPreviousPage,
  onGoToPage,
  onPageSizeChange,
}: TicketsTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Ticket>('idtickets');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Función para ordenar
  const handleSort = (column: keyof Ticket) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Ordenar tickets
  const sortedTickets = [...tickets].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue == null) return 1;
    if (bValue == null) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Función para obtener el badge de estado
  const getStatusBadge = (statusName?: string) => {
    if (!statusName) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          <Clock className="w-3 h-3" />
          Sin estado
        </span>
      );
    }

    const statusLower = statusName.toLowerCase();

    if (statusLower.includes('pending') || statusLower.includes('pendiente')) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3 h-3" />
          Pendiente
        </span>
      );
    }

    if (statusLower.includes('progress') || statusLower.includes('proceso')) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
          <Clock className="w-3 h-3" />
          En Progreso
        </span>
      );
    }

    if (statusLower.includes('answered') || statusLower.includes('respondido')) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          <CheckCircle className="w-3 h-3" />
          Respondido
        </span>
      );
    }

    if (statusLower.includes('closed') || statusLower.includes('cerrado')) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-50 text-gray-700 border border-gray-200">
          <XCircle className="w-3 h-3" />
          Cerrado
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
        {statusName}
      </span>
    );
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage < 3) {
        for (let i = 0; i < 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      } else if (currentPage > totalPages - 4) {
        pages.push(0);
        pages.push('...');
        for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-gray-500">No hay tickets disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('idtickets')}
            >
              <div className="flex items-center gap-2">
                ID
                {sortColumn === 'idtickets' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center gap-2">
                Título
                {sortColumn === 'title' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario Planifika
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asignado a
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTickets.map((ticket) => (
            <tr key={ticket.idtickets} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{ticket.idtickets}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="max-w-xs">
                  <div className="font-medium truncate">{ticket.title}</div>
                  <div className="text-gray-500 text-xs truncate mt-1">
                    {ticket.description}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(ticket.ticketstatusname)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ID: {ticket.idplanifikauser}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ticket.drimsoftusername || (
                  <span className="text-gray-400 italic">Sin asignar</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onViewTicket?.(ticket)}
                  className="inline-flex items-center gap-1 text-[#FFD369] hover:text-[#e6bf5d] transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info y selector de tamaño de página */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{currentPage * pageSize + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min((currentPage + 1) * pageSize, totalElements)}
                </span>{' '}
                de <span className="font-medium">{totalElements}</span> tickets
              </div>
              
              {onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <label htmlFor="pageSize" className="text-sm text-gray-700">
                    Por página:
                  </label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD369] focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}
            </div>

            {/* Controles de navegación */}
            <div className="flex items-center gap-2">
              {/* Primera página */}
              <button
                onClick={() => onGoToPage?.(0)}
                disabled={!hasPrevious}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Página anterior */}
              <button
                onClick={onPreviousPage}
                disabled={!hasPrevious}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Números de página */}
              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((pageNum, idx) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => onGoToPage?.(pageNum as number)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#FFD369] border-[#FFD369] text-[#222831] font-semibold'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {(pageNum as number) + 1}
                    </button>
                  )
                ))}
              </div>

              {/* Indicador móvil de página */}
              <div className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700">
                Página {currentPage + 1} de {totalPages}
              </div>

              {/* Página siguiente */}
              <button
                onClick={onNextPage}
                disabled={!hasNext}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Última página */}
              <button
                onClick={() => onGoToPage?.(totalPages - 1)}
                disabled={!hasNext}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
