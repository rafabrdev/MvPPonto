import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/auth';
import {
  Clock,
  BarChart3,
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  Timer
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
    href: '/dashboard'
  },
  {
    id: 'timeentry',
    label: 'Registrar Ponto',
    icon: <Clock className="h-5 w-5" />,
    href: '/time-entry'
  },
  {
    id: 'history',
    label: 'Histórico',
    icon: <Timer className="h-5 w-5" />,
    href: '/history'
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: <BarChart3 className="h-5 w-5" />,
    href: '/reports',
    roles: ['admin', 'manager']
  },
  {
    id: 'schedules',
    label: 'Expedientes',
    icon: <Calendar className="h-5 w-5" />,
    href: '/schedules'
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: <Users className="h-5 w-5" />,
    href: '/users',
    roles: ['admin', 'manager']
  }
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onCollapse
}) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-full bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col"
    >
      {/* Header */}
      <div className="h-16 px-6 flex items-center border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              MP
            </div>
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <h1 className="text-xl font-bold text-gradient">MvPPonto</h1>
                <p className="text-xs text-muted-foreground">Sistema de Ponto</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link key={item.id} to={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-lg shadow-primary/25' 
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                )}
              >
                <div className={cn(
                  'flex-shrink-0 transition-transform duration-200',
                  isActive && 'scale-110'
                )}>
                  {item.icon}
                </div>
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {item.badge && !collapsed && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full"
                  >
                    {item.badge}
                  </motion.span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <Link to="/settings">
          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium"
                >
                  Configurações
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>

        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-medium"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => onCollapse?.(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </motion.div>
  );
};