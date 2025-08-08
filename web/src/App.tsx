import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Login } from './pages/auth/Login';
import { Layout } from './components/layout/Layout';
import { useAuthStore } from './store/auth';
import './App.css';

// Criar instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente de rota protegida
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Página Dashboard temporária
const Dashboard: React.FC = () => {
  return (
    <Layout title="Dashboard" subtitle="Visão geral do sistema">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Funcionários Online</h3>
            <p className="text-3xl font-bold text-primary">42</p>
          </div>
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Horas Trabalhadas Hoje</h3>
            <p className="text-3xl font-bold text-green-600">336h</p>
          </div>
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Ausências</h3>
            <p className="text-3xl font-bold text-orange-500">3</p>
          </div>
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Atrasos</h3>
            <p className="text-3xl font-bold text-red-500">7</p>
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Bem-vindo ao MvPPonto!</h3>
          <p className="text-muted-foreground mb-4">
            Sistema de controle de ponto inteligente. Use as credenciais de demonstração na tela de login para explorar as funcionalidades.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Funcionalidades:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Controle de ponto em tempo real</li>
                <li>• Dashboard com métricas</li>
                <li>• Gestão de funcionários</li>
                <li>• Relatórios detalhados</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Credenciais de Teste:</h4>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• admin@mvpponto.com / admin123 (Admin)</li>
                <li>• pedro@mvpponto.com / manager123 (Gerente)</li>
                <li>• joao@mvpponto.com / user123 (Usuário)</li>
                <li>• maria@mvpponto.com / user123 (Usuário)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
