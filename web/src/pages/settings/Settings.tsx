import React from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [profileData, setProfileData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  
  const [preferences, setPreferences] = React.useState({
    theme: 'system',
    language: 'pt-BR',
    notifications: true,
    emailNotifications: true
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const updateData: any = {
        name: data.name,
        email: data.email
      };
      
      if (data.password && data.password === data.confirmPassword) {
        updateData.password = data.password;
      }
      
      return api.updateProfile(updateData);
    },
    onSuccess: (response) => {
      if (response.data) {
        updateUser(response.data);
      }
      alert('Perfil atualizado com sucesso!');
      setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    
    if (profileData.password && profileData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }
    
    updateProfileMutation.mutate(profileData);
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar salvamento de preferências no localStorage ou API
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    alert('Preferências salvas com sucesso!');
  };

  return (
    <Layout title="Configurações" subtitle="Gerencie suas configurações e preferências">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil do Usuário
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e senha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nova Senha (opcional)"
                    type="password"
                    value={profileData.password}
                    onChange={(e) => setProfileData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Deixe vazio para não alterar"
                  />
                  <Input
                    label="Confirmar Nova Senha"
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a nova senha"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  loading={updateProfileMutation.isLoading}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tema</label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={preferences.theme === 'light'}
                          onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                        />
                        <Sun className="h-4 w-4" />
                        <span className="text-sm">Claro</span>
                      </label>
                      <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={preferences.theme === 'dark'}
                          onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                        />
                        <Moon className="h-4 w-4" />
                        <span className="text-sm">Escuro</span>
                      </label>
                      <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          name="theme"
                          value="system"
                          checked={preferences.theme === 'system'}
                          onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                        />
                        <Monitor className="h-4 w-4" />
                        <span className="text-sm">Sistema</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Idioma</label>
                    <select
                      className="w-full mt-2 p-2 border border-border rounded-md bg-background"
                      value={preferences.language}
                      onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                </div>
                
                <Button type="submit" className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Preferências
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como você quer receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Notificações no Sistema</div>
                    <div className="text-sm text-muted-foreground">Receber notificações dentro do sistema</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Notificações por Email</div>
                    <div className="text-sm text-muted-foreground">Receber resumos e alertas por email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Informações sobre segurança da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Função Atual</div>
                    <div className="text-sm text-muted-foreground capitalize">{user?.role}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user?.role === 'admin' && '👑 Administrador'}
                    {user?.role === 'manager' && '🛡️ Gerente'}
                    {user?.role === 'user' && '👤 Usuário'}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium mb-2">Última Atualização</div>
                <div className="text-sm text-muted-foreground">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Settings;
