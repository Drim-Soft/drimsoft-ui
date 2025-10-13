import { 
  Role, 
  UserStatus, 
  UserDrimsoft, 
  CreateUserRequest, 
  SignUpRequest,
  ROLES,
  USER_STATUS
} from '../types/user';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const userService = {
  // Obtener todos los usuarios
  async getAllUsers(): Promise<UserDrimsoft[]> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return response.json();
  },

  // Obtener usuario por ID
  async getUserById(id: number): Promise<UserDrimsoft> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuario');
    }

    return response.json();
  },

  // Crear usuario (registro en Supabase + creación en BD)
  async createUser(userData: CreateUserRequest): Promise<UserDrimsoft> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    // Validar que las contraseñas coincidan
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    try {
      // 1. Registrar usuario en Supabase
      const signUpResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      if (!signUpResponse.ok) {
        let errorMessage = 'Error al crear cuenta en Supabase';
        try {
          const errorData = await signUpResponse.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear el error, usar el status text
          errorMessage = `Error ${signUpResponse.status}: ${signUpResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const signUpData = await signUpResponse.json();
      
      // Intentar obtener el ID de Supabase de diferentes posibles estructuras de respuesta
      let supabaseUserId = signUpData.user?.id || 
                          signUpData.id || 
                          signUpData.userId || 
                          signUpData.supabaseUserId ||
                          signUpData.data?.user?.id ||
                          signUpData.data?.id;

      // Log para debugging
      console.log('Respuesta del signup:', signUpData);

      if (!supabaseUserId) {
        console.error('Estructura de respuesta inesperada:', signUpData);
        throw new Error('No se pudo obtener el ID de Supabase. Estructura de respuesta: ' + JSON.stringify(signUpData));
      }

      // 2. Crear usuario en la base de datos
      const userResponse = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          supabaseUserId: supabaseUserId,
          status: { idUserStatus: userData.userStatusId },
          role: { idRole: userData.roleId },
        }),
      });

      if (!userResponse.ok) {
        let errorMessage = 'Error al crear usuario en la base de datos';
        try {
          const errorData = await userResponse.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${userResponse.status}: ${userResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return userResponse.json();
    } catch (error) {
      throw error;
    }
  },

  // Actualizar usuario
  async updateUser(id: number, userData: Partial<UserDrimsoft>): Promise<UserDrimsoft> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar usuario');
    }

    return response.json();
  },

  // Eliminar usuario (eliminación lógica)
  async deleteUser(id: number): Promise<UserDrimsoft> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar usuario');
    }

    return response.json();
  },

  // Asignar rol a usuario
  async assignRole(userId: number, roleId: number): Promise<UserDrimsoft> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/users/${userId}/roles/${roleId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al asignar rol');
    }

    return response.json();
  },

  // Actualizar estado de usuario
  async updateUserStatus(userId: number, statusId: number): Promise<UserDrimsoft> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/users/${userId}/status/${statusId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al actualizar estado');
    }

    return response.json();
  },

  // Obtener roles disponibles
  getAvailableRoles(): Role[] {
    return [
      { id: ROLES.ADMIN, name: 'Administrador' },
      { id: ROLES.DRIMSOFT_TEAM, name: 'Drimsoft Team' },
    ];
  },

  // Obtener estados disponibles
  getAvailableStatuses(): UserStatus[] {
    return [
      { id: USER_STATUS.ACTIVE, name: 'Activo' },
      { id: USER_STATUS.INACTIVE, name: 'Inactivo' },
      { id: USER_STATUS.DELETED, name: 'Eliminado' },
    ];
  },
};
