import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../store/auth';
import { getGreeting } from '../../lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  title,
  subtitle
}) => {
  const { user } = useAuthStore();
  const [isDark, setIsDark] = React.useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light');
  };

  const currentTime = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-col">
          {title ? (
            <>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </>
          ) : (
            <>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-foreground"
              >
                {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
              </motion.h1>
              <p className="text-sm text-muted-foreground">
                Hoje é {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <Input
          placeholder="Buscar..."
          leftIcon={<Search className="h-4 w-4" />}
          className="w-full"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Current Time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden sm:flex flex-col items-end"
        >
          <div className="text-sm font-mono font-semibold">
            {currentTime}
          </div>
          <div className="text-xs text-muted-foreground">
            Horário atual
          </div>
        </motion.div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </motion.div>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
          />
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-border/50">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
          
          <Avatar
            name={user?.name}
            size="default"
            variant="glow"
            showStatus
            status="online"
          />
        </div>
      </div>
    </header>
  );
};