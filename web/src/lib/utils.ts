import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatação de tempo
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Formatação de data
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Formatação de data curta
export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

// Formatação de duração em minutos para horas
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}min`;
  }
  
  return `${hours}h ${mins > 0 ? `${mins}min` : ''}`.trim();
}

// Calcular progresso em porcentagem
export function calculateProgress(worked: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((worked / total) * 100), 100);
}

// Obter saudação baseada no horário
export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Validar se é horário de trabalho
export function isWorkingHours(): boolean {
  const hour = new Date().getHours();
  return hour >= 7 && hour <= 19;
}

// Obter cor do status
export function getStatusColor(status: string): string {
  const colors = {
    'not_started': 'text-muted-foreground',
    'working': 'text-primary-500',
    'lunch': 'text-warning-500',
    'finished': 'text-success-500'
  };
  
  return colors[status as keyof typeof colors] || 'text-muted-foreground';
}

// Obter cor do progresso
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'bg-success-500';
  if (percentage >= 75) return 'bg-primary-500';
  if (percentage >= 50) return 'bg-warning-500';
  return 'bg-muted-foreground';
}

// Debounce
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Capitalizar primeira letra
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Gerar iniciais do nome
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Gerar cores consistentes baseadas em string
export function getColorFromString(str: string): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500'
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}