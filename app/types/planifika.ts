// Tipos mínimos para usuarios de Planifika (API externa)
// Estructura flexible con campos opcionales para tolerar cambios del backend.
export interface PlanifikaUser {
  id?: number;
  idUser?: number;
  name?: string;
  fullName?: string;
  email?: string;
  idUserType?: number;
  [key: string]: unknown;
}

export const PLANIFIKA_USER_TYPES = {
  ORG_ADMIN: 1,
} as const;


