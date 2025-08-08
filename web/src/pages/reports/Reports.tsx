import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Calendar,
  Users,
  Download,
  Filter,
  Target,
  Activity
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';
import { formatTime, formatDuration, formatDate } from '../../lib/utils';
import { useAuthStore } from '../../store/auth';

interface ReportMetric {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export const Reports: React.FC = () => {
  const { user } = useAuthStore();
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [selectedUserId, setSelectedUserId] = React.useState<string>('');

  // Set default dates (last 30 days)
  React.useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Fetch history data for reports
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['history-reports', { startDate, endDate, userId: selectedUserId }],
    queryFn: async () => {
      if (user?.role === 'admin' || user?.role === 'manager') {
        // Admin/Manager can see all users data
        const endpoint = selectedUserId 
          ? `/time-entries/admin/history?userId=${selectedUserId}&startDate=${startDate}&endDate=${endDate}&limit=1000`
          : `/time-entries/admin/history?startDate=${startDate}&endDate=${endDate}&limit=1000`;
        return api.request(endpoint);
      } else {
        // Regular user sees only their own data
        return api.getHistory({ startDate, endDate, limit: 1000 });
      }
    },
    enabled: !!startDate && !!endDate
  });

  // Fetch users for admin/manager
  const { data: usersData } = useQuery({
    queryKey: ['users-for-reports'],
    queryFn: () => api.getUsers(),
    enabled: user?.role === 'admin' || user?.role === 'manager'
  });

  const calculateMetrics = () => {
    if (!historyData?.data) return null;

    const entries = historyData.data.flatMap((day: any) => day.entries);
    const workingDays = historyData.data.length;
    
    // Calculate total working hours
    let totalMinutes = 0;
    let daysWithFullRecords = 0;
    let totalLunchTime = 0;
    
    historyData.data.forEach((day: any) => {
      const dayEntries = day.entries;
      const checkIn = dayEntries.find((e: any) => e.type === 'IN');
      const checkOut = dayEntries.find((e: any) => e.type === 'OUT');
      const lunchOut = dayEntries.find((e: any) => e.type === 'LUNCH_OUT');
      const lunchIn = dayEntries.find((e: any) => e.type === 'LUNCH_IN');
      
      if (checkIn && checkOut) {
        const start = new Date(checkIn.timestamp);
        const end = new Date(checkOut.timestamp);
        let dayMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        
        // Subtract lunch time if present
        if (lunchOut && lunchIn) {
          const lunchStart = new Date(lunchOut.timestamp);
          const lunchEnd = new Date(lunchIn.timestamp);
          const lunchMinutes = (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60);
          dayMinutes -= lunchMinutes;
          totalLunchTime += lunchMinutes;
        }
        
        totalMinutes += dayMinutes;
        daysWithFullRecords++;
      }
    });

    const averageHoursPerDay = daysWithFullRecords > 0 ? totalMinutes / daysWithFullRecords : 0;
    const expectedHoursPerDay = 8 * 60; // 8 hours in minutes
    const efficiency = expectedHoursPerDay > 0 ? (averageHoursPerDay / expectedHoursPerDay) * 100 : 0;

    return {
      totalHours: totalMinutes,
      workingDays: daysWithFullRecords,
      averageHoursPerDay,
      efficiency,
      totalLunchTime,
      totalEntries: entries.length
    };
  };

  const metrics = calculateMetrics();

  const reportMetrics: ReportMetric[] = [
    {
      title: 'Total de Horas',
      value: formatDuration(metrics?.totalHours || 0),
      change: '+12%',
      trend: 'up',
      icon: <Clock className="h-6 w-6" />,
      color: 'blue'
    },
    {
      title: 'Dias Trabalhados',
      value: String(metrics?.workingDays || 0),
      change: `${metrics?.workingDays || 0} de ${new Date(endDate || Date.now()).getDate()}`,
      icon: <Calendar className="h-6 w-6" />,
      color: 'green'
    },
    {
      title: 'Média por Dia',
      value: formatDuration(metrics?.averageHoursPerDay || 0),
      change: 'Meta: 8h',
      trend: (metrics?.averageHoursPerDay || 0) >= 480 ? 'up' : 'down',
      icon: <Target className="h-6 w-6" />,
      color: 'yellow'
    },
    {
      title: 'Eficiência',
      value: `${Math.round(metrics?.efficiency || 0)}%`,
      change: metrics && metrics.efficiency >= 100 ? 'Meta atingida' : 'Abaixo da meta',
      trend: (metrics?.efficiency || 0) >= 100 ? 'up' : 'down',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'purple'
    }
  ];

  const handleExport = () => {
    // Implementation for exporting reports
    const csvContent = historyData?.data?.map((day: any) => {
      return day.entries.map((entry: any) => 
        `${day.date},${entry.type},${formatTime(entry.timestamp)}`
      ).join('\n');
    }).join('\n');
    
    const blob = new Blob([`Data,Tipo,Horário\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-ponto-${startDate}-${endDate}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <Layout title="Relatórios" subtitle="Análise detalhada dos registros de ponto">
        <div className="space-y-6">
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

  return (
    <Layout title="Relatórios" subtitle="Análise detalhada dos registros de ponto">
      <div className="space-y-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <CardDescription>
                Selecione o período e usuário para gerar os relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Data Início"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="Data Fim"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Usuário</label>
                    <select
                      className="w-full p-2 border border-border rounded-md bg-background"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      <option value="">Todos os usuários</option>
                      {usersData?.data?.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-end">
                  <Button onClick={handleExport} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      {metric.change && (
                        <div className={`flex items-center text-xs ${
                          metric.trend === 'up' 
                            ? 'text-green-600' 
                            : metric.trend === 'down' 
                            ? 'text-red-600' 
                            : 'text-muted-foreground'
                        }`}>
                          {metric.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                          {metric.change}
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-xl bg-${metric.color}-500/10`}>
                      {metric.icon}
                    </div>
                  </div>
                </CardContent>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-l from-${metric.color}-500/5 to-transparent rounded-full transform translate-x-16 -translate-y-16`} />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Registros Detalhados
              </CardTitle>
              <CardDescription>
                Lista completa dos registros no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {historyData?.data?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum registro encontrado no período selecionado.
                  </p>
                )}

                {historyData?.data?.map((day: any) => (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        {formatDate(day.date)}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {day.entries.length} registros
                      </span>
                    </div>
                    
                    <div className="grid gap-2">
                      {day.entries.map((entry: any, index: number) => {
                        const typeLabels: Record<string, string> = {
                          IN: 'Entrada',
                          LUNCH_OUT: 'Saída Almoço',
                          LUNCH_IN: 'Volta Almoço',
                          OUT: 'Saída'
                        };

                        const typeColors: Record<string, string> = {
                          IN: 'bg-green-500/10 text-green-700 border-green-500/20',
                          LUNCH_OUT: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
                          LUNCH_IN: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
                          OUT: 'bg-red-500/10 text-red-700 border-red-500/20'
                        };

                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              typeColors[entry.type] || 'bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Activity className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {typeLabels[entry.type] || entry.type}
                              </span>
                            </div>
                            <span className="text-sm font-mono font-semibold">
                              {formatTime(entry.timestamp)}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Reports;
