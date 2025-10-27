const API_BASE_URL = process.env.NEXT_PUBLIC_DRIMSOFT_API_BASE_URL;

// Función para convertir errores técnicos en mensajes amigables para el usuario
const getFriendlyErrorMessage = (error: any, status?: number): string => {
  // Si ya es un mensaje amigable, devolverlo tal como está
  if (typeof error === 'string' && !error.includes('Error del servidor') && !error.includes('fetch')) {
    return error;
  }

  // Mensajes específicos por código de estado
  switch (status) {
    case 401:
      return 'Credenciales incorrectas. Verifica tu email y contraseña.';
    case 403:
      return 'No tienes permisos para acceder. Contacta al administrador.';
    case 404:
      return 'Usuario no encontrado. Verifica tu email.';
    case 500:
      return 'Error del servidor. Intenta nuevamente en unos minutos.';
    case 503:
      return 'Servicio temporalmente no disponible. Intenta más tarde.';
  }

  // Errores de red
  if (error?.message?.includes('fetch') || error?.message?.includes('NetworkError')) {
    return 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
  }

  if (error?.message?.includes('localhost:8080') || error?.message?.includes('/api/')) {
    return 'El servidor no está disponible. Contacta al administrador del sistema.';
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
  return 'Error al iniciar sesión. Verifica tus credenciales e intenta nuevamente.';
};

export const authService = {
  async login(email: string, password: string) {
    console.log('Intentando login con:', { email });
    console.log('URL del backend:', `${API_BASE_URL}/auth/login`);
    
    // Verificar si el backend está disponible
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

    console.log('Respuesta del login:', { 
      status: response.status, 
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    let data;
    try {
      const responseText = await response.text();
      console.log('Respuesta raw del servidor:', responseText);
      
      if (responseText.trim() === '') {
        const friendlyMessage = getFriendlyErrorMessage({ message: 'El servidor devolvió una respuesta vacía' });
        throw new Error(friendlyMessage);
      }
      
      data = JSON.parse(responseText);
      console.log('Datos parseados:', data);
    } catch (parseError) {
      console.error('Error al parsear respuesta JSON:', parseError);
      const friendlyMessage = getFriendlyErrorMessage(parseError);
      throw new Error(friendlyMessage);
    }

    if (!response.ok) {
      console.error('Error en login - Status:', response.status, 'Data:', data);
      const technicalError = data?.error || data?.message || `Error del servidor (${response.status}: ${response.statusText})`;
      const friendlyMessage = getFriendlyErrorMessage(technicalError, response.status);
      throw new Error(friendlyMessage);
    }

    const token = data.access_token;
    const user = data.user;
    const role = data.role; // always use top-level role
    const userName = data.userName;

    if (token) {
      localStorage.setItem('authToken', token);
    }

    if (user) {
      // Remove any user.role from user object before storing
      const userCopy = { ...user };
      if (userCopy.role && typeof userCopy.role === 'string') {
        delete userCopy.role;
      }
      localStorage.setItem('user', JSON.stringify(userCopy));
    }

    if (role && typeof role === 'object') {
      localStorage.setItem('userRole', JSON.stringify(role));
    }

    if (userName) {
      localStorage.setItem('userName', userName);
    }

    return data;
    } catch (networkError) {
      console.error('Error de red al intentar login:', networkError);
      const friendlyMessage = getFriendlyErrorMessage(networkError);
      throw new Error(friendlyMessage);
    }
  },

  async getUser() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('No se pudo obtener el usuario');

    const data = await response.json();

    if (data.role && typeof data.role === 'object') {
      localStorage.setItem('userRole', JSON.stringify(data.role));
    }

    if (data.userName) {
      localStorage.setItem('userName', data.userName);
    }

    return data;
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getUserRole() {
    const role = localStorage.getItem('userRole');
    return role ? JSON.parse(role) : null;
  },

  getUserName() {
    return localStorage.getItem('userName');
  },

  isAdministrator(): boolean {
    const role = this.getUserRole();
    return role && role.id === 1;
  },

  isDrimsoftTeam(): boolean {
    const role = this.getUserRole();
    return role && role.id === 2;
  },

  getRoleName(): string {
    const role = this.getUserRole();
    return role ? role.name : '';
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
  },

    async updateProfile(data: { name?: string; password?: string }) {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No autenticado');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const responseText = await response.text();

            if (responseText.trim() === '') {
                const friendlyMessage = getFriendlyErrorMessage(
                    { message: 'El servidor devolvió una respuesta vacía' }
                );
                throw new Error(friendlyMessage);
            }

            let parsedData;
            try {
                parsedData = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Error al parsear respuesta JSON (updateProfile):', parseError);
                const friendlyMessage = getFriendlyErrorMessage(parseError);
                throw new Error(friendlyMessage);
            }

            if (!response.ok) {
                console.error('Error en updateProfile - Status:', response.status, 'Data:', parsedData);
                const technicalError =
                    parsedData?.error ||
                    parsedData?.message ||
                    `Error del servidor (${response.status}: ${response.statusText})`;
                const friendlyMessage = getFriendlyErrorMessage(technicalError, response.status);
                throw new Error(friendlyMessage);
            }

            if (parsedData?.name) {
                localStorage.setItem('userName', parsedData.name);
            }

            if (parsedData?.user) {
                localStorage.setItem('user', JSON.stringify(parsedData.user));
            }

            return parsedData;
        } catch (error: any) {
            console.error('Error de red en updateProfile:', error);
            const friendlyMessage = getFriendlyErrorMessage(error);
            throw new Error(friendlyMessage);
        }
    },
};
