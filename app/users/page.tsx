'use client';

import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { UserDrimsoft } from '../types/user';
import { Button } from '../components/button';
import { Card } from '../components/card';
import CreateUserForm from '../components/CreateUserForm';
import UsersTable from '../components/UsersTable';
import { Plus, Users, AlertCircle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserDrimsoft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setShowCreateForm(false);
    setSuccessMessage('Usuario creado exitosamente');
    await loadUsers();
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleEditUser = (user: UserDrimsoft) => {
    // TODO: Implementar edición de usuario
    console.log('Editar usuario:', user);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      setSuccessMessage('Usuario eliminado exitosamente');
      await loadUsers();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar usuario');
    }
  };


  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-[#FFD369] to-[#FFD369]/80 rounded-xl">
                <Users className="w-6 h-6 text-[#222831]" />
              </div>
              <h1 className="text-3xl font-bold text-[#222831]">Gestión de Usuarios</h1>
            </div>
            <p className="text-gray-600">
              Administre los usuarios del sistema y sus permisos
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-3">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-green-600">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Formulario de creación */}
        {showCreateForm && (
          <CreateUserForm
            onSuccess={handleCreateUser}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Tabla de usuarios */}
        <UsersTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          isLoading={isLoading}
        />

        {/* Estadísticas */}
        {!isLoading && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-semibold">A</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.status.id === 1).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">AD</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role.id === 1).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}