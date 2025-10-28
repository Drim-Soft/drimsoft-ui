// Tipos para el sistema de tickets

export interface TicketStatus {
  idTicketStatus: number;
  name: string;
}

export interface UserDrimsoft {
  idUser: number;
  name: string;
}

export interface Ticket {
  idtickets: number;
  idplanifikauser: number;
  idticketstatus?: number;
  ticketstatusname?: string;
  title: string;
  description: string;
  answer?: string;
  iddrimsoftuser?: number;
  drimsoftusername?: string;
}

export interface TicketCreateRequest {
  idplanifikauser: number;
  title: string;
  description: string;
  iddrimsoftuser?: number;
  idticketstatus?: number;
}

export interface TicketAnswerRequest {
  answer: string;
  iddrimsoftuser?: number;
}

export interface TicketAssignRequest {
  iddrimsoftuser: number;
}

export interface TicketMarkReadRequest {
  iddrimsoftuser?: number;
}

export const TICKET_STATUS = {
  PENDING: 1,
  IN_PROGRESS: 2,
  ANSWERED: 3,
  CLOSED: 4,
} as const;
