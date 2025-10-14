import { 
  Role, 
  UserStatus, 
  UserDrimsoft, 
  CreateUserRequest, 
  SignUpRequest,
  ROLES,
  USER_STATUS
} from '../types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_DRIMSOFT_API_BASE_URL;

// Función para convertir errores técnicos en mensajes amigables para el usuario
const getFriendlyErrorMessage = (error: any, context: string = 'operación'): string => {
  // Si ya es un mensaje amigable, devolverlo tal como está
  if (typeof error === 'string' && !error.includes('Error del servidor') && !error.includes('fetch')) {
    return error;
  }

  // Errores de red
  if (error?.message?.includes('fetch') || error?.message?.includes('NetworkError')) {
    return 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
  }

  if (error?.message?.includes('localhost:8080') || error?.message?.includes('/api/')) {
    return 'El servidor no está disponible. Contacta al administrador del sistema.';
  }

  // Errores de permisos específicos
  if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
    if (context.includes('asignar rol')) {
      return 'No tienes permisos para cambiar roles de usuario. Contacta al administrador.';
    }
    if (context.includes('actualizar estado')) {
      return 'No tienes permisos para cambiar el estado de usuario. Contacta al administrador.';
    }
    return 'No tienes permisos para realizar esta operación. Contacta al administrador.';
  }

  // Errores de Supabase específicos
  if (error?.message?.includes('Supabase') || error?.message?.includes('supabase.co')) {
    return 'Error de autenticación. El usuario puede no estar confirmado.';
  }

  // Errores de parsing JSON
  if (error?.message?.includes('JSON') || error?.message?.includes('parse')) {
    return 'Error de comunicación con el servidor. Intenta nuevamente.';
  }

  // Errores de respuesta vacía
  if (error?.message?.includes('respuesta vacía')) {
    return 'El servidor no respondió correctamente. Intenta nuevamente.';
  }

  // Mensaje genérico para errores no identificados
  return `Error al ${context}. Intenta nuevamente.`;
};

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
      const friendlyMessage = getFriendlyErrorMessage('Error al obtener usuarios', 'cargar usuarios');
      throw new Error(friendlyMessage);
    }

    const users = await response.json();
    
    // Mapear las propiedades del backend al frontend
    return users.map((user: any) => ({
      ...user,
      id: user.idUser, // Mapear idUser a id
      role: {
        ...user.role,
        id: user.role.idRole // Mapear idRole a id
      },
      status: {
        ...user.status,
        id: user.status.idUserStatus // Mapear idUserStatus a id
      }
    }));
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
      const friendlyMessage = getFriendlyErrorMessage('Error al obtener usuario', 'cargar usuario');
      throw new Error(friendlyMessage);
    }

    const user = await response.json();
    
    // Mapear las propiedades del backend al frontend
    return {
      ...user,
      id: user.idUser, // Mapear idUser a id
      role: {
        ...user.role,
        id: user.role.idRole // Mapear idRole a id
      },
      status: {
        ...user.status,
        id: user.status.idUserStatus // Mapear idUserStatus a id
      }
    };
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
      console.log('Creando usuario en Supabase:', { email: userData.email });
      
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

      console.log('Respuesta del signup:', { status: signUpResponse.status, statusText: signUpResponse.statusText });

      if (!signUpResponse.ok) {
        let errorMessage = 'Error al crear cuenta en Supabase';
        try {
          const errorData = await signUpResponse.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear el error, usar el status text
          errorMessage = `Error ${signUpResponse.status}: ${signUpResponse.statusText}`;
        }
        const friendlyMessage = getFriendlyErrorMessage(errorMessage, 'crear cuenta');
        throw new Error(friendlyMessage);
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
        const friendlyMessage = getFriendlyErrorMessage('No se pudo obtener el ID de Supabase', 'crear usuario');
        throw new Error(friendlyMessage);
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
        const friendlyMessage = getFriendlyErrorMessage(errorMessage, 'crear usuario');
        throw new Error(friendlyMessage);
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

    try {
      console.log('Asignando rol usando endpoint PUT con usuario completo:', { userId, roleId });
      
      // Obtener el usuario actual primero
      const currentUser = await this.getUserById(userId);
      console.log('Usuario actual obtenido:', currentUser);
      
      // Crear un objeto con el usuario completo pero solo el rol modificado
      const userUpdate = {
        idUser: currentUser.idUser,
        name: currentUser.name,
        supabaseUserId: currentUser.supabaseUserId,
        role: { 
          idRole: roleId, 
          name: roleId === 1 ? 'Administrador' : 'Drimsoft Team' 
        },
        status: currentUser.status
      };
      
      console.log('Usuario a enviar:', userUpdate);
      
      // Usar el endpoint PUT que sabemos que funciona
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userUpdate),
      });

      if (!response.ok) {
        let errorMessage = 'Error al asignar rol';
        let errorData = null;
        
        try {
          const responseText = await response.text();
          console.log('Raw response text:', responseText);
          
          if (responseText) {
            errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          }
        } catch (e) {
          console.log('Could not parse error response as JSON:', e);
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        console.error('Error completo en assignRole:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          errorData,
          userId,
          roleId,
          url: `${API_BASE_URL}/users/${userId}/roles/${roleId}`,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        const friendlyMessage = getFriendlyErrorMessage(errorMessage, 'asignar rol');
        throw new Error(friendlyMessage);
      }

      const result = await response.json();
      console.log('Respuesta del backend:', result);
      
      // Mapear la respuesta del backend al formato del frontend
      const mappedResult = {
        id: result.idUser, // Mapear idUser a id
        idUser: result.idUser, // Mantener idUser para compatibilidad
        name: result.name,
        supabaseUserId: result.supabaseUserId,
        role: {
          id: result.role.idRole, // Mapear idRole a id
          idRole: result.role.idRole, // Mantener idRole para compatibilidad
          name: result.role.name
        },
        status: {
          id: result.status.idUserStatus, // Mapear idUserStatus a id
          idUserStatus: result.status.idUserStatus, // Mantener idUserStatus para compatibilidad
          name: result.status.name
        }
      };
      
      console.log('Usuario mapeado:', mappedResult);
      return mappedResult;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const friendlyMessage = getFriendlyErrorMessage(error, 'asignar rol');
      throw new Error(friendlyMessage);
    }
  },

  // Actualizar estado de usuario
  async updateUserStatus(userId: number, statusId: number): Promise<UserDrimsoft> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    try {
      console.log('Actualizando estado:', { userId, statusId });
      
      // Si es estado 3 (eliminado), usar el endpoint DELETE que sabemos que funciona
      if (statusId === 3) {
        console.log('Usando endpoint DELETE para estado eliminado');
        return await this.deleteUser(userId);
      }
      
      // Para otros estados, usar el endpoint PUT original
      console.log('Usando endpoint PUT para estado:', statusId);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/status/${statusId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = 'Error al actualizar estado';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        console.error('Error en updateUserStatus:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          userId,
          statusId
        });
        
        const friendlyMessage = getFriendlyErrorMessage(errorMessage, 'actualizar estado');
        throw new Error(friendlyMessage);
      }

      const result = await response.json();
      
      // Mapear la respuesta del backend al formato del frontend
      const mappedResult = {
        id: result.idUser, // Mapear idUser a id
        idUser: result.idUser, // Mantener idUser para compatibilidad
        name: result.name,
        supabaseUserId: result.supabaseUserId,
        role: {
          id: result.role.idRole, // Mapear idRole a id
          idRole: result.role.idRole, // Mantener idRole para compatibilidad
          name: result.role.name
        },
        status: {
          id: result.status.idUserStatus, // Mapear idUserStatus a id
          idUserStatus: result.status.idUserStatus, // Mantener idUserStatus para compatibilidad
          name: result.status.name
        }
      };
      
      return mappedResult;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const friendlyMessage = getFriendlyErrorMessage(error, 'actualizar estado');
      throw new Error(friendlyMessage);
    }
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
