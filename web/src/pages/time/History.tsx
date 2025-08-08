import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Coffee, ArrowRight, LogOut, Edit, Save, X } from 'lucide-react';
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
  const [editingEntry, setEditingEntry] = React.useState<string | null>(null);
  const [editTime, setEditTime] = React.useState<string>('');
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['history', { startDate, endDate, page, limit }],
    queryFn: async () => {
      return api.getHistory({ startDate: startDate || undefined, endDate: endDate || undefined, page, limit });
    },
    keepPreviousData: true,
  });

  const history = data?.data || [];
  const pagination = data?.pagination;

  // Mutation for updating time entries
  const updateEntryMutation = useMutation({
    mutationFn: async ({ entryId, newTimestamp }: { entryId: string; newTimestamp: string }) => {
      return api.updateTimeEntry(entryId, { timestamp: newTimestamp });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditingEntry(null);
      setEditTime('');
    },
    onError: (error) => {
      console.error('Failed to update entry:', error);
      alert('Falha ao atualizar o registro. Tente novamente.');
    }
  });

  const applyFilters = () => {
    setPage(1);
    refetch();
  };

  const handleEditStart = (entry: TimeEntry) => {
    setEditingEntry(entry.id);
    // Convert timestamp to HH:mm format for time input
    const date = new Date(entry.timestamp);
    const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    setEditTime(timeString);
  };

  const handleEditSave = (entryId: string, originalTimestamp: string) => {
    if (!editTime) {
      alert('Por favor, insira um horário válido.');
      return;
    }

    // Convert time string to timestamp
    const originalDate = new Date(originalTimestamp);
    const [hours, minutes] = editTime.split(':').map(Number);
    
    const newDate = new Date(originalDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);

    updateEntryMutation.mutate({
      entryId,
      newTimestamp: newDate.toISOString()
    });
  };

  const handleEditCancel = () => {
    setEditingEntry(null);
    setEditTime('');
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
            <CardDescription>
              {isLoading ? 'Carregando...' : 'Lista agrupada por dia'}
              {!isLoading && history.length > 0 && (
                <span className="block mt-1 text-xs text-muted-foreground">
                  💡 Passe o mouse sobre um registro para ver a opção de editar o horário
                </span>
              )}
            </CardDescription>
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

                      const isEditing = editingEntry === entry.id;
                      
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`group flex items-center justify-between p-3 rounded-lg border ${
                            typeColors[entry.type] || 'bg-muted/50'
                          } ${isEditing ? 'ring-2 ring-primary/20' : ''} hover:shadow-sm transition-all duration-200`}
                        >
                          <div className="flex items-center gap-3">
                            {typeIcons[entry.type]}
                            <span className="text-sm font-medium">
                              {typeLabels[entry.type] || entry.type}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <input
                                  type="time"
                                  value={editTime}
                                  onChange={(e) => setEditTime(e.target.value)}
                                  className="px-2 py-1 text-xs font-mono border border-border rounded bg-background"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSave(entry.id, entry.timestamp)}
                                  disabled={updateEntryMutation.isLoading}
                                  className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleEditCancel}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="text-sm font-mono font-semibold">
                                  {formatTime(entry.timestamp)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditStart(entry)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
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

