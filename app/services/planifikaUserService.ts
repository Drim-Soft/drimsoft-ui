import { PlanifikaUser, PLANIFIKA_USER_TYPES } from "../types/planifika";

const PLANIFIKA_API_BASE_URL =
  process.env.NEXT_PUBLIC_PLANIFIKA_USERS_API_BASE_URL;
const PLANIFIKA_SERVICE_ROLE_KEY =
  process.env.NEXT_PUBLIC_PLANIFIKA_SERVICE_ROLE_KEY;

if (!PLANIFIKA_API_BASE_URL) {
  // No arrojamos error en import-time para no romper el build; se valida en runtime.
  // eslint-disable-next-line no-console
  console.warn(
    "[planifikaUserService] Falta NEXT_PUBLIC_PLANIFIKA_USERS_API_BASE_URL"
  );
}

class PlanifikaUserService {
  private getAuthHeaders() {
    const headers: Record<string, string> = {
      "ngrok-skip-browser-warning": "true",
    };
    // Usar Service Role Key para Planifika si está configurado
    if (PLANIFIKA_SERVICE_ROLE_KEY) {
      headers.Authorization = `Bearer ${PLANIFIKA_SERVICE_ROLE_KEY}`;
      // En caso de que el backend espere x-api-key en vez de Authorization
      headers["x-api-key"] = PLANIFIKA_SERVICE_ROLE_KEY;
    }
    return headers;
  }

  private buildUrl(path: string): string {
    if (!PLANIFIKA_API_BASE_URL) {
      throw new Error(
        "Config faltante: NEXT_PUBLIC_PLANIFIKA_USERS_API_BASE_URL no está definida."
      );
    }
    return `${PLANIFIKA_API_BASE_URL}${path}`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Planifika Error: ${response.status} - ${errorText}`);
    }
    if (response.status === 204) {
      return {} as T;
    }
    return response.json();
  }

  async getAllUsers(): Promise<PlanifikaUser[]> {
    const url = this.buildUrl("/users");
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    const data = await this.handleResponse<any>(response);
    return Array.isArray(data) ? (data as PlanifikaUser[]) : [];
  }

  async getUserById(id: number): Promise<PlanifikaUser> {
    const url = this.buildUrl(`/users/${id}`);
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<PlanifikaUser>(response);
  }

  async getAdminUsers(): Promise<PlanifikaUser[]> {
    // Filtro local por idUserType === 1 según especificación
    const users = await this.getAllUsers();
    return users.filter(
      (u) => Number((u as any).idUserType) === PLANIFIKA_USER_TYPES.ORG_ADMIN
    );
  }
}

export const planifikaUserService = new PlanifikaUserService();


