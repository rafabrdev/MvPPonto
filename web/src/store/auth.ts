import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos simples para demonstração
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Dados de demonstração
const mockUsers: Record<string, User> = {
  'admin@mvpponto.com': {
    id: '1',
    name: 'Administrador',
    email: 'admin@mvpponto.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  'pedro@mvpponto.com': {
    id: '2',
    name: 'Pedro Silva',
    email: 'pedro@mvpponto.com',
    role: 'manager',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  'joao@mvpponto.com': {
    id: '3',
    name: 'João Santos',
    email: 'joao@mvpponto.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  'maria@mvpponto.com': {
    id: '4',
    name: 'Maria Oliveira',
    email: 'maria@mvpponto.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

const validPasswords: Record<string, string> = {
  'admin@mvpponto.com': 'admin123',
  'pedro@mvpponto.com': 'manager123',
  'joao@mvpponto.com': 'user123',
  'maria@mvpponto.com': 'user123'
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const { email, password } = credentials;
          
          // Verificar credenciais
          if (!mockUsers[email] || validPasswords[email] !== password) {
            throw new Error('Email ou senha inválidos');
          }
          
          const user = mockUsers[email];
          
          // Simular tokens
          const tokens = {
            accessToken: `mock-token-${user.id}`,
            refreshToken: `mock-refresh-${user.id}`
          };
          
          // Salvar tokens
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro no login',
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      logout: () => {
        // Remover tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        
        if (!token || !token.startsWith('mock-token-')) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        
        try {
          // Extrair ID do token simulado
          const userId = token.replace('mock-token-', '');
          const user = Object.values(mockUsers).find(u => u.id === userId);
          
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error('Token inválido');
          }
        } catch (error) {
          // Token inválido
          get().logout();
          set({ isLoading: false });
        }
      },

      updateUser: (user) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
