const API_BASE_URL = 'http://localhost:8080/api/v1';

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
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
};
