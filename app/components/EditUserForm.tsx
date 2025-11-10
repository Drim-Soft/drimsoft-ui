'use client';

import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { UserDrimsoft, Role, UserStatus } from '../types/user';
import { Button } from './button';
import Modal from './Modal';
import { Shield, UserCheck, Save, X } from 'lucide-react';

interface EditUserFormProps {
  isOpen: boolean;
  user: UserDrimsoft | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditUserForm({ isOpen, user, onSuccess, onCancel }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    roleId: 1,
    userStatusId: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roles = userService.getAvailableRoles();
  const statuses = userService.getAvailableStatuses();

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    console.log('EditUserForm useEffect:', { user, isOpen, userExists: !!user });
    
    if (user && isOpen) {
      console.log('Cargando datos del usuario:', {
        userId: user.idUser,
        roleId: user.role?.id,
        userStatusId: user.status?.id,
        user: user
      });
      
      if (!user.idUser) {
        console.error('Usuario sin ID:', user);
        return;
      }
      
      if (!user.role || !user.status) {
        console.error('Usuario sin rol o estado:', user);
        return;
      }
      
      setFormData({
        roleId: user.role.id,
        userStatusId: user.status.id,
      });
      setErrors({});
    }
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    console.log('Validando formulario con datos:', formData);

    if (formData.roleId === null || formData.roleId === undefined || formData.roleId === 0) {
      newErrors.roleId = 'El rol es requerido';
    }

    if (formData.userStatusId === null || formData.userStatusId === undefined || formData.userStatusId === 0) {
      newErrors.userStatusId = 'El estado es requerido';
    }

    console.log('Errores encontrados:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('handleSubmit called:', { user, formData, userExists: !!user });
    
    if (!user) {
      console.error('Usuario es null o undefined');
      return;
    }
    
    if (!user.idUser) {
      console.error('Usuario sin ID:', user);
      return;
    }
    
    if (!user.role || !user.status) {
      console.error('Usuario sin rol o estado:', user);
      return;
    }
    
    if (!validateForm()) {
      console.error('Formulario inválido:', { formData, errors });
      return;
    }

    setIsLoading(true);
    setErrors({}); // Limpiar errores previos
    
    try {
      console.log('Iniciando actualización de usuario:', {
        userId: user.idUser,
        currentRole: user.role?.id,
        newRole: formData.roleId,
        currentStatus: user.status?.id,
        newStatus: formData.userStatusId
      });

      // Actualizar rol si cambió
      if (formData.roleId !== user.role.id) {
        console.log('Actualizando rol...');
        await userService.assignRole(user.idUser, formData.roleId);
        console.log('Rol actualizado exitosamente');
      }

      // Actualizar estado si cambió
      if (formData.userStatusId !== user.status.id) {
        console.log('Actualizando estado...');
        await userService.updateUserStatus(user.idUser, formData.userStatusId);
        console.log('Estado actualizado exitosamente');
      }

      console.log('Usuario actualizado exitosamente');
      onSuccess();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al actualizar usuario' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario cambie el valor
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Editar Usuario">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-600">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            {/* <p className="text-sm text-gray-600">{user.email}</p> */}
          </div>
        </div>
        <p className="text-gray-600">Modifica el rol y estado del usuario</p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuración de Usuario */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Configuración de Usuario
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                id="role"
                value={formData.roleId}
                onChange={(e) => handleInputChange('roleId', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                  errors.roleId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleId && <p className="text-red-500 text-sm mt-1">{errors.roleId}</p>}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                value={formData.userStatusId}
                onChange={(e) => handleInputChange('userStatusId', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                  errors.userStatusId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
              {errors.userStatusId && <p className="text-red-500 text-sm mt-1">{errors.userStatusId}</p>}
            </div>
          </div>
        </div>

        {/* Información de Solo Lectura */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Información del Usuario
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
                {user.name}
              </div>
              <p className="text-xs text-gray-500 mt-1">No se puede modificar</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {/* <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
                {user.email}
              </div> */}
              <p className="text-xs text-gray-500 mt-1">No se puede modificar</p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-red-500 text-gray-700 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gray-800 hover:bg-gray-900 text-white transition-colors duration-200 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Guardar Cambios
              </div>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
