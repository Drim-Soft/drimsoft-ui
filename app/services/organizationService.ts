// Usamos la variable definida en .env (`NEXT_PUBLIC_API_ORGANIZATIONS_URL`).
// Si en el futuro se define `NEXT_PUBLIC_ORGANIZATIONS_API_BASE_URL`, podríamos hacer fallback.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_ORGANIZATIONS_URL || process.env.NEXT_PUBLIC_ORGANIZATIONS_API_BASE_URL;

console.log('[organizationService] API_BASE_URL:', API_BASE_URL);

export interface Organization {
  id?: number;
  nit: string;
  name: string;
  address?: string;
  phone?: string;
  photoURL?: string;
  domain?: string;
  users?: any[];
}

export interface CreateOrganizationRequest {
  nit: string;
  name: string;
  address?: string;
  phone?: string;
  photoURL?: string;
  domain?: string;
}

export interface UpdateOrganizationRequest {
  nit: string;
  name: string;
  address?: string;
  phone?: string;
  photoURL?: string;
  domain?: string;
}

class OrganizationService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          }
        });
      return this.handleResponse<Organization[]>(response);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  }

  // Nuevo endpoint paginado: GET /organizations/paginated?page=0&size=10
  async getOrganizationsPaginated(page: number = 0, size: number = 10, search?: string): Promise<{
    content: Organization[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    try {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (search && search.trim().length > 0) params.set('search', search.trim());
      const url = `${API_BASE_URL}/organizations/paginated?${params.toString()}`;
      console.log('[organizationService] Fetch paginated organizations:', { url, page, size, search });
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        }
      });
      const data = await this.handleResponse<any>(response);
      // Aseguramos estructura defensiva ante posibles diferencias.
      return {
        content: Array.isArray(data.content) ? data.content : [],
        totalElements: typeof data.totalElements === 'number' ? data.totalElements : 0,
        totalPages: typeof data.totalPages === 'number' ? data.totalPages : 0,
        size: typeof data.size === 'number' ? data.size : size,
        number: typeof data.number === 'number' ? data.number : page,
      };
    } catch (error) {
      console.error('Error fetching paginated organizations:', error);
      throw error;
    }
  }

  async getOrganizationById(id: number): Promise<Organization> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${id}`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          }
        });
      return this.handleResponse<Organization>(response);
    } catch (error) {
      console.error(`Error fetching organization ${id}:`, error);
      throw error;
    }
  }

  async createOrganization(organization: CreateOrganizationRequest): Promise<Organization> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organization),
      });
      return this.handleResponse<Organization>(response);
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  async updateOrganization(id: number, organization: UpdateOrganizationRequest): Promise<Organization> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
        method: 'PUT',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organization),
      });
      return this.handleResponse<Organization>(response);
    } catch (error) {
      console.error(`Error updating organization ${id}:`, error);
      throw error;
    }
  }

  async deleteOrganization(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      await this.handleResponse<void>(response);
    } catch (error) {
      console.error(`Error deleting organization ${id}:`, error);
      throw error;
    }
  }

  async getUsersByOrganization(id: number): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${id}/users`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      return this.handleResponse<any[]>(response);
    } catch (error) {
      console.error(`Error fetching users for organization ${id}:`, error);
      throw error;
    }
  }
}

export const organizationService = new OrganizationService();
