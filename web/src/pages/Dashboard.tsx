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
    whileHover={{ y: -2 }}
    transition={{ duration: 0.3 }}
    className="h-full"
  >
    <Card className="relative overflow-hidden h-full hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${
            color === 'primary' ? 'from-primary-500/15 to-primary-600/10' :
            color === 'green' ? 'from-green-500/15 to-green-600/10' :
            color === 'yellow' ? 'from-yellow-500/15 to-yellow-600/10' :
            'from-purple-500/15 to-purple-600/10'
          }`}>
            {icon}
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-xl font-bold text-foreground">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
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
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <div className={`p-3 rounded-full ${currentStatus.bgColor} shadow-lg`}>
                      <StatusIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-sm font-medium text-muted-foreground">Status atual</p>
                      <p className={`text-xl font-bold ${currentStatus.color}`}>
                        {currentStatus.label}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Entrada</p>
                        <p className="text-xl font-mono font-bold">
                          {dashboardData?.entries.checkIn 
                            ? formatTime(dashboardData.entries.checkIn)
                            : '--:--'
                          }
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Saída Almoço</p>
                        <p className="text-xl font-mono font-bold">
                          {dashboardData?.entries.lunchOut 
                            ? formatTime(dashboardData.entries.lunchOut)
                            : '--:--'
                          }
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Volta Almoço</p>
                        <p className="text-xl font-mono font-bold">
                          {dashboardData?.entries.lunchIn 
                            ? formatTime(dashboardData.entries.lunchIn)
                            : '--:--'
                          }
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Saída</p>
                        <p className="text-xl font-mono font-bold">
                          {dashboardData?.entries.checkOut 
                            ? formatTime(dashboardData.entries.checkOut)
                            : '--:--'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center lg:items-end space-y-4">
                  <div className="text-center lg:text-right">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Progresso do dia</p>
                    <p className="text-4xl font-bold">{progress}%</p>
                  </div>
                  
                  <div className="w-40 h-3 bg-white/30 rounded-full overflow-hidden border border-white/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                    />
                  </div>
                  
                  <div className="text-center lg:text-right">
                    <p className="text-sm font-medium text-muted-foreground">
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
            icon={<Timer className="h-5 w-5 text-primary-500" />}
            color="primary"
          />
          
          <MetricCard
            title="Meta do Dia"
            value={formatDuration(dashboardData?.workingHours.expectedTotal || 480)}
            subtitle="8 horas padrão"
            icon={<Target className="h-5 w-5 text-green-500" />}
            color="green"
          />
          
          <MetricCard
            title="Eficiência"
            value={`${progress}%`}
            subtitle="Do dia atual"
            icon={<Award className="h-5 w-5 text-yellow-500" />}
            color="yellow"
          />
          
          <MetricCard
            title="Dias no Mês"
            value="22"
            subtitle="22 trabalháveis"
            icon={<Calendar className="h-5 w-5 text-purple-500" />}
            color="purple"
          />
        </div>

        {/* Últimas Atividades */}
        <div>
          <div className="w-full">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Activity className="h-5 w-5" />
                  Últimas Atividades
                </CardTitle>
                <CardDescription>
                  Seus registros mais recentes do dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
                        <div className="text-center py-12 text-muted-foreground">
                          <Timer className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p className="text-lg font-medium">Nenhuma atividade registrada hoje</p>
                          <p className="text-sm mt-1">Seus registros de ponto aparecerão aqui</p>
                        </div>
                      );
                    }
                    
                    return activities.map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <motion.div
                          key={activity.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/50 hover:shadow-md transition-all duration-200"
                        >
                          <div className={`p-3 rounded-full ${activity.color} shadow-lg`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{activity.label}</p>
                            <p className="text-sm text-muted-foreground">
                              Registrado hoje
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-mono font-bold">
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
      </div>
    </Layout>
  );
};