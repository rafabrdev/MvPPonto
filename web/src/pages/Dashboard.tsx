import React from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  Users, 
  Coffee,
  CheckCircle2,
  Timer,
  Target,
  Activity,
  Award
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { formatTime, formatDuration, calculateProgress, getStatusColor } from '../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  color = 'primary' 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-${color}-500/10`}>
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center mt-4 text-xs ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend.value}% vs. semana passada
          </div>
        )}
      </CardContent>
      
      {/* Background gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-l from-${color}-500/5 to-transparent rounded-full transform translate-x-16 -translate-y-16`} />
    </Card>
  </motion.div>
);

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  const queryClient = useQueryClient();

  // Buscar dados do dashboard
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.getDashboard();
      return response.data;
    },
    refetchInterval: 60000 // Atualizar a cada minuto
  });

  // Mutação para registrar ponto de acordo com o status atual
  const createEntryMutation = useMutation({
    mutationFn: async (type: 'IN' | 'LUNCH_OUT' | 'LUNCH_IN' | 'OUT') => {
      await api.createTimeEntry(type);
    },
    onSuccess: () => {
      // Recarregar dados do dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const getNextAction = () => {
    const status = dashboardData?.status || 'not_started';
    const entries = dashboardData?.entries || {};

    if (status === 'not_started') {
      return { label: 'Registrar Entrada', type: 'IN' as const, disabled: false };
    }
    
    if (status === 'working') {
      // Se não saiu para almoço ainda, pode sair para almoço ou registrar saída final
      if (!entries.lunchOut) {
        return { label: 'Saída para Almoço', type: 'LUNCH_OUT' as const, disabled: false };
      }
      // Se já voltou do almoço, próxima ação é saída final
      if (entries.lunchIn) {
        return { label: 'Registrar Saída', type: 'OUT' as const, disabled: false };
      }
      // Se saiu para almoço mas não voltou, deveria estar em status 'lunch'
      return { label: 'Volta do Almoço', type: 'LUNCH_IN' as const, disabled: false };
    }
    
    if (status === 'lunch') {
      return { label: 'Volta do Almoço', type: 'LUNCH_IN' as const, disabled: false };
    }
    
    // finished
    return { label: 'Dia Finalizado', type: 'OUT' as const, disabled: true };
  };

  const nextAction = getNextAction();

  const handleQuickAction = () => {
    if (nextAction.disabled) return;
    createEntryMutation.mutate(nextAction.type);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      </Layout>
    );
  }

  const progress = calculateProgress(
    dashboardData?.workingHours.worked || 0,
    dashboardData?.workingHours.expectedTotal || 480
  );

  const statusConfig = {
    not_started: { 
      label: 'Não iniciado', 
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      icon: Timer 
    },
    working: { 
      label: 'Trabalhando', 
      color: 'text-primary-500',
      bgColor: 'bg-primary-500',
      icon: Activity 
    },
    lunch: { 
      label: 'Almoçando', 
      color: 'text-warning-500',
      bgColor: 'bg-warning-500',
      icon: Coffee 
    },
    finished: { 
      label: 'Finalizado', 
      color: 'text-success-500',
      bgColor: 'bg-success-500',
      icon: CheckCircle2 
    }
  };

  const currentStatus = statusConfig[dashboardData?.status || 'not_started'];
  const StatusIcon = currentStatus.icon;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Status Card Principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-r from-primary-500/10 via-primary-600/10 to-primary-700/10 border-primary-500/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${currentStatus.bgColor}`}>
                      <StatusIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status atual</p>
                      <p className={`text-lg font-semibold ${currentStatus.color}`}>
                        {currentStatus.label}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Entrada</p>
                      <p className="text-xl font-mono font-semibold">
                        {dashboardData?.entries.checkIn 
                          ? formatTime(dashboardData.entries.checkIn)
                          : '--:--'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saída Almoço</p>
                      <p className="text-xl font-mono font-semibold">
                        {dashboardData?.entries.lunchOut 
                          ? formatTime(dashboardData.entries.lunchOut)
                          : '--:--'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volta Almoço</p>
                      <p className="text-xl font-mono font-semibold">
                        {dashboardData?.entries.lunchIn 
                          ? formatTime(dashboardData.entries.lunchIn)
                          : '--:--'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Progresso do dia</p>
                    <p className="text-3xl font-bold">{progress}%</p>
                  </div>
                  
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(dashboardData?.workingHours.worked || 0)} trabalhadas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(dashboardData?.workingHours.remaining || 0)} restantes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Horas Trabalhadas"
            value={formatDuration(dashboardData?.workingHours.worked || 0)}
            subtitle="Hoje"
            icon={<Timer className="h-6 w-6 text-primary-500" />}
            trend={{ value: 12, isPositive: true }}
            color="primary"
          />
          
          <MetricCard
            title="Meta do Dia"
            value={formatDuration(dashboardData?.workingHours.expectedTotal || 480)}
            subtitle="8 horas padrão"
            icon={<Target className="h-6 w-6 text-green-500" />}
            color="green"
          />
          
          <MetricCard
            title="Eficiência"
            value={`${progress}%`}
            subtitle="Do dia atual"
            icon={<Award className="h-6 w-6 text-yellow-500" />}
            trend={{ value: 8, isPositive: true }}
            color="yellow"
          />
          
          <MetricCard
            title="Dias no Mês"
            value="22"
            subtitle="22 trabalháveis"
            icon={<Calendar className="h-6 w-6 text-purple-500" />}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Registre seu ponto rapidamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                size="lg"
                variant={dashboardData?.status === 'not_started' ? 'default' : 'secondary'}
                onClick={handleQuickAction}
                disabled={createEntryMutation.isLoading || nextAction.disabled}
                loading={createEntryMutation.isLoading}
              >
                <Clock className="h-4 w-4" />
                {nextAction.label}
              </Button>
              
              <Link to="/history">
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4" />
                  Ver Histórico
                </Button>
              </Link>
              
              <Link to="/time-entry">
                <Button variant="outline" className="w-full">
                  <Clock className="h-4 w-4" />
                  Registrar Ponto
                </Button>
              </Link>
              
              <Link to="/schedules">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4" />
                  Expedientes
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Últimas Atividades */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Últimas Atividades</CardTitle>
              <CardDescription>
                Seus registros mais recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const entries = dashboardData?.entries || {};
                  const activities = [];
                  
                  if (entries.checkIn) {
                    activities.push({
                      key: 'checkIn',
                      label: 'Entrada registrada',
                      time: entries.checkIn,
                      icon: Clock,
                      color: 'bg-green-500'
                    });
                  }
                  
                  if (entries.lunchOut) {
                    activities.push({
                      key: 'lunchOut',
                      label: 'Saída para almoço',
                      time: entries.lunchOut,
                      icon: Coffee,
                      color: 'bg-yellow-500'
                    });
                  }
                  
                  if (entries.lunchIn) {
                    activities.push({
                      key: 'lunchIn',
                      label: 'Volta do almoço',
                      time: entries.lunchIn,
                      icon: Coffee,
                      color: 'bg-blue-500'
                    });
                  }
                  
                  if (entries.checkOut) {
                    activities.push({
                      key: 'checkOut',
                      label: 'Saída registrada',
                      time: entries.checkOut,
                      icon: CheckCircle2,
                      color: 'bg-red-500'
                    });
                  }
                  
                  if (activities.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <Timer className="h-8 w-8 mx-auto mb-2" />
                        <p>Nenhuma atividade registrada hoje</p>
                      </div>
                    );
                  }
                  
                  return activities.map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                      <motion.div
                        key={activity.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                      >
                        <div className={`p-2 rounded-full ${activity.color}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(activity.time)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};