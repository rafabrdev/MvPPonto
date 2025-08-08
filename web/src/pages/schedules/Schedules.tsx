import React from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Edit, Trash2, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layout } from '../../components/layout/Layout';
import { api, type Schedule } from '../../lib/api';
import { formatDate } from '../../lib/utils';

interface TimePreset {
  label: string;
  start: string;
  end: string;
  lunchStart?: string;
  lunchEnd?: string;
}

const TIME_PRESETS: TimePreset[] = [
  { label: 'Padrão (08:00 - 17:00)', start: '08:00', end: '17:00', lunchStart: '12:00', lunchEnd: '13:00' },
  { label: 'Matutino (06:00 - 14:00)', start: '06:00', end: '14:00', lunchStart: '10:00', lunchEnd: '11:00' },
  { label: 'Vespertino (14:00 - 22:00)', start: '14:00', end: '22:00', lunchStart: '18:00', lunchEnd: '19:00' },
  { label: 'Noturno (22:00 - 06:00)', start: '22:00', end: '06:00' },
  { label: 'Meio Período (08:00 - 12:00)', start: '08:00', end: '12:00' },
  { label: 'Personalizado', start: '', end: '' }
];

export const SchedulesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [date, setDate] = React.useState<string>('');
  const [startTime, setStartTime] = React.useState<string>('08:00');
  const [endTime, setEndTime] = React.useState<string>('17:00');
  const [lunchStart, setLunchStart] = React.useState<string>('12:00');
  const [lunchEnd, setLunchEnd] = React.useState<string>('13:00');
  const [selectedPreset, setSelectedPreset] = React.useState<string>('Padrão (08:00 - 17:00)');
  const [editingSchedule, setEditingSchedule] = React.useState<Schedule | null>(null);
  const [filterDate, setFilterDate] = React.useState<string>('');
  const [alertDismissed, setAlertDismissed] = React.useState<boolean>(false);

  // Set today as default date
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    
    // Check if alert was previously dismissed
    const dismissed = localStorage.getItem('schedules-alert-dismissed');
    if (dismissed === 'true') {
      setAlertDismissed(true);
    }
  }, []);

  const { data: listData, isLoading } = useQuery({
    queryKey: ['schedules', { filterDate }],
    queryFn: async () => {
      const resp = await api.getSchedules({ 
        startDate: filterDate || undefined, 
        endDate: filterDate || undefined 
      });
      return resp.data ?? [];
    },
  });

  // Load default schedule
  const { data: defaultData } = useQuery({
    queryKey: ['schedules-default'],
    queryFn: () => api.getDefaultSchedule()
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Schedule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (editingSchedule) {
        return api.updateSchedule(editingSchedule.id, data);
      } else {
        return api.createSchedule(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const presetData = TIME_PRESETS.find(p => p.label === preset);
    if (presetData && preset !== 'Personalizado') {
      setStartTime(presetData.start);
      setEndTime(presetData.end);
      setLunchStart(presetData.lunchStart || '');
      setLunchEnd(presetData.lunchEnd || '');
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setStartTime('08:00');
    setEndTime('17:00');
    setLunchStart('12:00');
    setLunchEnd('13:00');
    setSelectedPreset('Padrão (08:00 - 17:00)');
    setEditingSchedule(null);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setDate(schedule.date);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setLunchStart(schedule.lunchStart || '');
    setLunchEnd(schedule.lunchEnd || '');
    setSelectedPreset('Personalizado');
  };

  const handleSubmit = () => {
    if (!date || !startTime || !endTime) {
      alert('Preencha ao menos a data, horário de início e fim.');
      return;
    }

    createMutation.mutate({
      date,
      startTime,
      endTime,
      lunchStart: lunchStart || undefined,
      lunchEnd: lunchEnd || undefined
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este expediente?')) {
      deleteMutation.mutate(id);
    }
  };

  const dismissAlert = () => {
    setAlertDismissed(true);
    localStorage.setItem('schedules-alert-dismissed', 'true');
  };

  return (
    <Layout title="Expedientes" subtitle="Configure seus horários de trabalho - NÃO é para editar registros de ponto já feitos">
      <div className="space-y-8">
        {/* Aviso Dismissível */}
        {!alertDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/60 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <h3 className="font-semibold text-blue-900 text-sm md:text-base">🔔 O que são Expedientes?</h3>
                    <div className="text-xs md:text-sm text-blue-800 space-y-1 leading-relaxed">
                      <p>• <strong>Expedientes</strong> são seus <strong>horários de trabalho planejados</strong> para cada dia</p>
                      <p>• Use para definir quando você <strong>deve começar e terminar</strong> o trabalho</p>
                      <p>• <strong>NÃO é para editar</strong> registros de ponto já batidos - isso fica no Histórico</p>
                      <p className="hidden sm:block">• Exemplo: "Amanhã vou trabalhar das 08:00 às 17:00 com almoço das 12:00 às 13:00"</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissAlert}
                    className="flex-shrink-0 h-8 w-8 p-0 hover:bg-blue-100/50 text-blue-600 hover:text-blue-700"
                    aria-label="Fechar aviso"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingSchedule ? 'Editar Expediente' : 'Novo Expediente'}
              </CardTitle>
              <CardDescription>
                {editingSchedule 
                  ? 'Atualize os horários do expediente selecionado' 
                  : 'Defina os horários para um dia específico'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Modelo de Horário</label>
                <select
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                >
                  {TIME_PRESETS.map((preset) => (
                    <option key={preset.label} value={preset.label}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input 
                  type="date" 
                  label="Data" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <Input 
                  type="time" 
                  label="Horário de Início" 
                  value={startTime} 
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (selectedPreset !== 'Personalizado') {
                      setSelectedPreset('Personalizado');
                    }
                  }}
                  required
                />
                <Input 
                  type="time" 
                  label="Horário de Fim" 
                  value={endTime} 
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    if (selectedPreset !== 'Personalizado') {
                      setSelectedPreset('Personalizado');
                    }
                  }}
                  required
                />
                <Input 
                  type="time" 
                  label="Início do Almoço (opcional)" 
                  value={lunchStart} 
                  onChange={(e) => {
                    setLunchStart(e.target.value);
                    if (selectedPreset !== 'Personalizado') {
                      setSelectedPreset('Personalizado');
                    }
                  }}
                />
                <Input 
                  type="time" 
                  label="Fim do Almoço (opcional)" 
                  value={lunchEnd} 
                  onChange={(e) => {
                    setLunchEnd(e.target.value);
                    if (selectedPreset !== 'Personalizado') {
                      setSelectedPreset('Personalizado');
                    }
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmit}
                  loading={createMutation.isLoading}
                  className="flex-1 sm:flex-none"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {editingSchedule ? 'Atualizar' : 'Salvar'} Expediente
                </Button>
                
                {editingSchedule && (
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    className="flex-1 sm:flex-none"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter and List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Meus Expedientes
                  </CardTitle>
                  <CardDescription>
                    Lista dos seus expedientes configurados
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    type="date"
                    placeholder="Filtrar por data"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full sm:w-auto"
                  />
                  {filterDate && (
                    <Button 
                      variant="outline" 
                      onClick={() => setFilterDate('')}
                      size="sm"
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading && (
                  <div className="text-center py-8">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                      <div className="h-3 bg-muted rounded w-1/3 mx-auto" />
                    </div>
                  </div>
                )}
                
                {!isLoading && (!listData || listData.length === 0) && (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum expediente encontrado</h3>
                    <p className="text-muted-foreground">
                      {filterDate 
                        ? 'Não há expedientes cadastrados para a data selecionada.' 
                        : 'Comece criando seu primeiro expediente acima.'
                      }
                    </p>
                  </div>
                )}

                {listData && listData.map((schedule, index) => (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary-500" />
                          <span className="font-semibold">
                            {new Date(schedule.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Jornada:</span>
                            <span className="ml-2 font-mono font-semibold">
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          
                          {schedule.lunchStart && schedule.lunchEnd && (
                            <div>
                              <span className="text-muted-foreground">Almoço:</span>
                              <span className="ml-2 font-mono font-semibold">
                                {schedule.lunchStart} - {schedule.lunchEnd}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SchedulesPage;

