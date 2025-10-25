'use client';

import { useState } from 'react';
import { Ticket } from '../types/ticket';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TicketsTableProps {
  tickets: Ticket[];
  onViewTicket?: (ticket: Ticket) => void;
}

export default function TicketsTable({ tickets, onViewTicket }: TicketsTableProps) {
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

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-gray-500">No hay tickets disponibles</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
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
  );
}
