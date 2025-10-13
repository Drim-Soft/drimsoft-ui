'use client';

import { useState } from 'react';
import { userService } from '../services/userService';
import { UserDrimsoft, Role, UserStatus } from '../types/user';
import { Button } from './button';
import { Card } from './card';
import { 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  UserX, 
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';

interface UsersTableProps {
  users: UserDrimsoft[];
  onEdit: (user: UserDrimsoft) => void;
  onDelete: (userId: number) => void;
  isLoading?: boolean;
}

export default function UsersTable({ 
  users, 
  onEdit, 
  onDelete, 
  isLoading = false 
}: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<number | ''>('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const roles = userService.getAvailableRoles();
  const statuses = userService.getAvailableStatuses();

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === '' || user.role.id === filterRole;
    const matchesStatus = filterStatus === '' || user.status.id === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: UserStatus) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status.id) {
      case 1: // Activo
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
      case 2: // Inactivo
        return `${baseClasses} bg-gray-100 text-gray-600 border border-gray-200`;
      case 3: // Eliminado
        return `${baseClasses} bg-gray-100 text-gray-500 border border-gray-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const getRoleBadge = (role: Role) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (role.id) {
      case 1: // Administrador
        return `${baseClasses} bg-gray-100 text-blue-600 border border-gray-200`;
      case 2: // Drimsoft Team
        return `${baseClasses} bg-gray-100 text-blue-600 border border-gray-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Cargando usuarios...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Filtros y búsqueda */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Filtro por rol */}
          <div className="md:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div className="md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Todos los estados</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white">
          <thead>
            <tr className="border-b border-gray-200 bg-white">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500 bg-white">
                  {searchTerm || filterRole || filterStatus 
                    ? 'No se encontraron usuarios con los filtros aplicados'
                    : 'No hay usuarios registrados'
                  }
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.idUser} className="border-b border-gray-100 hover:bg-gray-50 bg-white">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-700 font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">ID: {user.idUser}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className={getRoleBadge(user.role)}>
                      {user.role.name}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className={getStatusBadge(user.status)}>
                      {user.status.name}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(user)}
                        className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(user.idUser)}
                        className="h-8 w-8 p-0 border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Información de resultados */}
      {filteredUsers.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Mostrando {filteredUsers.length} de {users.length} usuarios
        </div>
      )}
    </div>
  );
}
