// Tipos da API
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  type: 'IN' | 'LUNCH_OUT' | 'LUNCH_IN' | 'OUT';
  timestamp: string;
  createdAt: string;
  user?: User;
}

export interface Schedule {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  lunchStart?: string;
  lunchEnd?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface DashboardData {
  date: string;
  entries: {
    checkIn?: string;
    lunchOut?: string;
    lunchIn?: string;
    checkOut?: string;
  };
  workingHours: {
    worked: number;
    remaining: number;
    expectedTotal: number;
  };
  status: 'not_started' | 'working' | 'lunch' | 'finished';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any;
  timestamp: string;
  path: string;
  method: string;
  stack?: string;
}

// Configuração da API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado - tentar refresh
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          throw new Error('Sessão expirada');
        }
        // Não retornar aqui - deixar o código continuar para retry
        throw new Error('TOKEN_REFRESH_NEEDED');
      }

      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || 'Erro na requisição');
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Erro no refresh token:', error);
    }
    return false;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error.message === 'TOKEN_REFRESH_NEEDED') {
        // Retry a requisição após refresh
        const response = await fetch(url, {
          ...options,
          headers: {
            ...(await this.getAuthHeaders()),
            ...options.headers
          }
        });
        return await this.handleResponse<T>(response);
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async me(): Promise<User> {
    return this.request('/auth/me');
  }

  // Time entries
  async createTimeEntry(type: TimeEntry['type']): Promise<ApiResponse<TimeEntry>> {
    return this.request('/time-entries', {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  }

  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return this.request('/time-entries/dashboard');
  }

  async getHistory(params: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<Array<{ date: string; entries: TimeEntry[] }>>> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return this.request(`/time-entries/history${queryString ? `?${queryString}` : ''}`);
  }

  // Users
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request('/users/profile');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getUsers(params: {
    role?: string;
    search?: string;
  } = {}): Promise<ApiResponse<User[]>> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/admin${queryString ? `?${queryString}` : ''}`);
  }

  async createUser(data: Partial<User> & { password: string }): Promise<ApiResponse<User>> {
    return this.request('/users/admin', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request(`/users/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/admin/${id}`, {
      method: 'DELETE'
    });
  }

  // Schedules
  async getSchedules(params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<Schedule[]>> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/schedules${queryString ? `?${queryString}` : ''}`);
  }

  async createSchedule(data: Omit<Schedule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Schedule>> {
    return this.request('/schedules', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateSchedule(id: string, data: Partial<Schedule>): Promise<ApiResponse<Schedule>> {
    return this.request(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteSchedule(id: string): Promise<void> {
    return this.request(`/schedules/${id}`, {
      method: 'DELETE'
    });
  }

  async getDefaultSchedule(): Promise<ApiResponse<Partial<Schedule>>> {
    return this.request('/schedules/default');
  }
}

export const api = new ApiClient(API_BASE_URL);