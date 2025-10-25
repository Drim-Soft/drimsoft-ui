import { Ticket, TicketCreateRequest, TicketAnswerRequest, TicketAssignRequest, TicketMarkReadRequest } from '../types/ticket';

const API_BASE_URL = process.env.NEXT_PUBLIC_DRIMSOFT_API_BASE_URL;

// Función para convertir errores técnicos en mensajes amigables
const getFriendlyErrorMessage = (error: any, context: string = 'operación'): string => {
  if (typeof error === 'string' && !error.includes('Error del servidor') && !error.includes('fetch')) {
    return error;
  }

  if (error?.message?.includes('fetch') || error?.message?.includes('NetworkError')) {
    return 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
  }

  if (error?.message?.includes('localhost:8080') || error?.message?.includes('/api/')) {
    return 'El servidor no está disponible. Contacta al administrador del sistema.';
  }

  if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
    return 'No tienes permisos para realizar esta operación. Contacta al administrador.';
  }

  return `Error al ${context}. Intenta nuevamente.`;
};

export const ticketService = {
  // Obtener todos los tickets
  async getAllTickets(): Promise<Ticket[]> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const friendlyMessage = getFriendlyErrorMessage('Error al obtener tickets', 'cargar tickets');
        throw new Error(friendlyMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const friendlyMessage = getFriendlyErrorMessage(error, 'cargar tickets');
      throw new Error(friendlyMessage);
    }
  },

  // Obtener tickets por usuario de Planifika
  async getTicketsByPlanifikaUser(idPlanifikaUser: number): Promise<Ticket[]> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    try {
      const response = await fetch(`${API_BASE_URL}/tickets?idplanifikauser=${idPlanifikaUser}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const friendlyMessage = getFriendlyErrorMessage('Error al obtener tickets', 'cargar tickets');
        throw new Error(friendlyMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const friendlyMessage = getFriendlyErrorMessage(error, 'cargar tickets');
      throw new Error(friendlyMessage);
    }
  },

  // Obtener tickets asignados a un usuario de Drimsoft
  async getTicketsByDrimsoftUser(idDrimsoftUser: number): Promise<Ticket[]> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    try {
      const response = await fetch(`${API_BASE_URL}/tickets?iddrimsoftuser=${idDrimsoftUser}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const friendlyMessage = getFriendlyErrorMessage('Error al obtener tickets', 'cargar tickets');
        throw new Error(friendlyMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const friendlyMessage = getFriendlyErrorMessage(error, 'cargar tickets');
      throw new Error(friendlyMessage);
    }
  },

  // Obtener un ticket por ID
  async getTicketById(id: number): Promise<Ticket> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const friendlyMessage = getFriendlyErrorMessage('Error al obtener ticket', 'cargar ticket');
        throw new Error(friendlyMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const friendlyMessage = getFriendlyErrorMessage(error, 'cargar ticket');
      throw new Error(friendlyMessage);
    }
  },

  // Crear un nuevo ticket
  async createTicket(ticketData: TicketCreateRequest): Promise<Ticket> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        let errorMessage = 'Error al crear ticket';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        const friendlyMessage = getFriendlyErrorMessage(errorMessage, 'crear ticket');
        throw new Error(friendlyMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const friendlyMessage = getFriendlyErrorMessage(error, 'crear ticket');
      throw new Error(friendlyMessage);
    }
  },

  // Agregar respuesta a un ticket
  async addAnswer(ticketId: number, answerData: TicketAnswerRequest): Promise<Ticket> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/answer`, {
        method: 'PATCH',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          answer: answerData.answer,
          iddrimsoftuser: answerData.iddrimsoftuser,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Error al responder ticket';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        const friendlyMessage = getFriendlyErrorMessage(errorMessage, 'responder ticket');
        throw new Error(friendlyMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const friendlyMessage = getFriendlyErrorMessage(error, 'responder ticket');
      throw new Error(friendlyMessage);
    }
  },

  // Actualizar estado de un ticket
  async updateStatus(ticketId: number, statusId: number): Promise<Ticket> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status/${statusId}`, {
        method: 'PATCH',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Error al actualizar estado';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        const friendlyMessage = getFriendlyErrorMessage(errorMessage, 'actualizar estado del ticket');
        throw new Error(friendlyMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const friendlyMessage = getFriendlyErrorMessage(error, 'actualizar estado del ticket');
      throw new Error(friendlyMessage);
    }
  },

  // Asignar usuario a un ticket
  async assignUser(ticketId: number, userId: number): Promise<Ticket> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/assign/${userId}`, {
        method: 'PATCH',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Error al asignar usuario';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        const friendlyMessage = getFriendlyErrorMessage(errorMessage, 'asignar usuario al ticket');
        throw new Error(friendlyMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const friendlyMessage = getFriendlyErrorMessage(error, 'asignar usuario al ticket');
      throw new Error(friendlyMessage);
    }
  },

  // Marcar ticket como leído
  async markAsRead(ticketId: number, userId?: number): Promise<Ticket> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    try {
      const body = userId ? { iddrimsoftuser: userId } : {};
      
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/read`, {
        method: 'PATCH',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMessage = 'Error al marcar como leído';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        const friendlyMessage = getFriendlyErrorMessage(errorMessage, 'marcar ticket como leído');
        throw new Error(friendlyMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const friendlyMessage = getFriendlyErrorMessage(error, 'marcar ticket como leído');
      throw new Error(friendlyMessage);
    }
  },

  // Obtener todos los estados de tickets disponibles
  async getAllStatuses(): Promise<any[]> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado');

    try {
      // Asumiendo que existe un endpoint para obtener estados
      // Si no existe, puedes devolver estados hardcodeados
      return [
        { idTicketStatus: 1, name: 'OPEN' },
        { idTicketStatus: 2, name: 'IN_PROGRESS' },
        { idTicketStatus: 3, name: 'RESOLVED' },
        { idTicketStatus: 4, name: 'CLOSED' },
        { idTicketStatus: 5, name: 'ANSWERED' },
      ];
    } catch (error) {
      return [];
    }
  },
};
