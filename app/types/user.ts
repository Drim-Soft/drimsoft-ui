// Tipos basados en los modelos del backend Java

export interface Role {
  id: number;
  name: string;
}

export interface UserStatus {
  id: number;
  name: string;
}

export interface UserDrimsoft {
  idUser: number;
  name: string;
  supabaseUserId: string;
  status: UserStatus;
  role: Role;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleId: number;
  userStatusId: number;
}

export interface SignUpRequest {
  email: string;
  password: string;
}

// Constantes para roles
export const ROLES = {
  ADMIN: 1,
  DRIMSOFT_TEAM: 2,
} as const;

// Constantes para estados
export const USER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 2,
  DELETED: 3,
} as const;
