import React from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Clock, 
  Coffee,
  CheckCircle2,
  Timer,
  Activity,
  PlayCircle,
  PauseCircle,
  StopCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { formatTime, formatDuration, getStatusColor } from '../../lib/utils';

interface TimeEntryAction {
  type: 'IN' | 'LUNCH_OUT' | 'LUNCH_IN' | 'OUT';
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  disabled?: boolean;
}

const actionConfigs: Record<string, TimeEntryAction> = {
  IN: {
    type: 'IN',
    label: 'Registrar Entrada',
    description: 'Iniciar jornada de trabalho',
    icon: <PlayCircle className="h-5 w-5" />,
    color: 'green'
  },
  LUNCH_OUT: {
    type: 'LUNCH_OUT',
    label: 'Saída para Almoço',
    description: 'Pausar trabalho para almoço',
    icon: <PauseCircle className="h-5 w-5" />,
    color: 'yellow'
  },
  LUNCH_IN: {
    type: 'LUNCH_IN',
    label: 'Volta do Almoço',
    description: 'Retomar trabalho após almoço',
    icon: <ArrowRight className="h-5 w-5" />,
    color: 'blue'
  },
  OUT: {
    type: 'OUT',
    label: 'Registrar Saída',
    description: 'Finalizar jornada de trabalho',
    icon: <StopCircle className="h-5 w-5" />,
    color: 'red'
  }
};

export const TimeEntry: React.FC = () => {
  const queryClient = useQueryClient();

  // Buscar dados do dashboard para determinar status atual
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.getDashboard();
      return response.data;
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Mutação para registrar ponto
  const createEntryMutation = useMutation({
    mutationFn: async (type: 'IN' | 'LUNCH_OUT' | 'LUNCH_IN' | 'OUT') => {
      const response = await api.createTimeEntry(type);
      return response;
    },
    onSuccess: () => {
      // Recarregar dados do dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });

  const getAvailableActions = (): TimeEntryAction[] => {
    const status = dashboardData?.status || 'not_started';
    const entries = dashboardData?.entries || {};

    switch (status) {
      case 'not_started':
        return [actionConfigs.IN];
      
      case 'working':
        // Se ainda não saiu para almoço, pode sair para almoço ou registrar saída
        if (!entries.lunchOut) {
          return [actionConfigs.LUNCH_OUT, actionConfigs.OUT];
        }
        // Se já voltou do almoço, só pode registrar saída
        if (entries.lunchIn) {
          return [actionConfigs.OUT];
        }
        // Se saiu para almoço mas não voltou, só pode voltar
        return [actionConfigs.LUNCH_IN];
      
      case 'lunch':
        return [actionConfigs.LUNCH_IN];
      
      case 'finished':
        return [{...actionConfigs.OUT, disabled: true, label: 'Jornada Finalizada'}];
      
      default:
        return [];
    }
  };

  const handleAction = (action: TimeEntryAction) => {
    if (action.disabled) return;
    createEntryMutation.mutate(action.type);
  };

  if (isLoading) {
    return (
      <Layout title="Registrar Ponto" subtitle="Gerencie seus registros de entrada e saída">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded-lg w-80" />
            <div className="h-40 bg-muted rounded-lg w-80" />
          </div>
        </div>
      </Layout>
    );
  }

  const availableActions = getAvailableActions();
  const currentTime = new Date();
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
    <Layout title="Registrar Ponto" subtitle="Gerencie seus registros de entrada e saída">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Status Atual */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center bg-gradient-to-r from-primary-500/10 via-primary-600/10 to-primary-700/10 border-primary-500/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-full ${currentStatus.bgColor}`}>
                  <StatusIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Status Atual</h3>
                  <p className={`text-lg font-semibold ${currentStatus.color}`}>
                    {currentStatus.label}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatTime(currentTime)} - {new Date().toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Registros do Dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Registros de Hoje</CardTitle>
              <CardDescription>
                {dashboardData?.date ? new Date(dashboardData.date).toLocaleDateString('pt-BR') : 'Hoje'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Entrada</p>
                  <p className="text-xl font-mono font-bold">
                    {dashboardData?.entries.checkIn 
                      ? formatTime(dashboardData.entries.checkIn)
                      : '--:--'
                    }
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Saída Almoço</p>
                  <p className="text-xl font-mono font-bold">
                    {dashboardData?.entries.lunchOut 
                      ? formatTime(dashboardData.entries.lunchOut)
                      : '--:--'
                    }
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Volta Almoço</p>
                  <p className="text-xl font-mono font-bold">
                    {dashboardData?.entries.lunchIn 
                      ? formatTime(dashboardData.entries.lunchIn)
                      : '--:--'
                    }
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Saída</p>
                  <p className="text-xl font-mono font-bold">
                    {dashboardData?.entries.checkOut 
                      ? formatTime(dashboardData.entries.checkOut)
                      : '--:--'
                    }
                  </p>
                </div>
              </div>
              
              {/* Resumo de horas trabalhadas */}
              <div className="mt-6 p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Horas Trabalhadas</p>
                    <p className="text-2xl font-bold">
                      {formatDuration(dashboardData?.workingHours.worked || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Restante</p>
                    <p className="text-lg font-semibold">
                      {formatDuration(dashboardData?.workingHours.remaining || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ações Disponíveis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Ações Disponíveis</CardTitle>
              <CardDescription>
                Selecione uma ação para registrar seu ponto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {availableActions.map((action, index) => (
                  <motion.div
                    key={action.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Button
                      onClick={() => handleAction(action)}
                      disabled={action.disabled || createEntryMutation.isLoading}
                      loading={createEntryMutation.isLoading}
                      size="lg"
                      variant={action.disabled ? "outline" : "default"}
                      className={`w-full h-20 text-left justify-start ${
                        !action.disabled ? `bg-${action.color}-500 hover:bg-${action.color}-600` : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          action.disabled ? 'bg-muted' : `bg-${action.color}-400`
                        }`}>
                          {action.icon}
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{action.label}</p>
                          <p className="text-sm opacity-80">{action.description}</p>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
              
              {availableActions.length === 0 && (
                <div className="text-center py-8">
                  <Timer className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma ação disponível no momento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default TimeEntry;
