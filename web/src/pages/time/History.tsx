import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Clock, Coffee, ArrowRight, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layout } from '../../components/layout/Layout';
import { api, type TimeEntry } from '../../lib/api';
import { formatTime } from '../../lib/utils';

export const History: React.FC = () => {
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(1);
  const [limit] = React.useState<number>(10);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['history', { startDate, endDate, page, limit }],
    queryFn: async () => {
      return api.getHistory({ startDate: startDate || undefined, endDate: endDate || undefined, page, limit });
    },
    keepPreviousData: true,
  });

  const history = data?.data || [];
  const pagination = data?.pagination;

  const applyFilters = () => {
    setPage(1);
    refetch();
  };

  return (
    <Layout title="Histórico" subtitle="Seus registros agrupados por dia">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Selecione um intervalo de datas para filtrar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Início" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input label="Fim" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <div className="md:col-span-2 flex items-end">
                <Button onClick={applyFilters} loading={isFetching}>Aplicar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registros</CardTitle>
            <CardDescription>{isLoading ? 'Carregando...' : 'Lista agrupada por dia'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {history.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
              )}

              {history.map((group) => (
                <div key={group.date} className="space-y-2">
                  <p className="font-semibold">{group.date}</p>
                  <div className="grid gap-2">
                    {group.entries.map((entry: TimeEntry, index: number) => {
                      const typeLabels: Record<string, string> = {
                        IN: 'Entrada',
                        LUNCH_OUT: 'Saída para Almoço',
                        LUNCH_IN: 'Volta do Almoço',
                        OUT: 'Saída'
                      };

                      const typeColors: Record<string, string> = {
                        IN: 'bg-green-500/10 text-green-700 border-green-500/20',
                        LUNCH_OUT: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
                        LUNCH_IN: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
                        OUT: 'bg-red-500/10 text-red-700 border-red-500/20'
                      };

                      const typeIcons: Record<string, React.ReactNode> = {
                        IN: <Clock className="h-4 w-4" />,
                        LUNCH_OUT: <Coffee className="h-4 w-4" />,
                        LUNCH_IN: <ArrowRight className="h-4 w-4" />,
                        OUT: <LogOut className="h-4 w-4" />
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
                            {typeIcons[entry.type]}
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

              {pagination && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-muted-foreground">Página {pagination.page} de {pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={pagination.page <= 1 || isFetching}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      disabled={pagination.page >= pagination.totalPages || isFetching}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default History;

