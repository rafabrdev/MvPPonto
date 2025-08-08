import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight, Clock, BarChart3, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuthStore } from '../../store/auth';
import { cn } from '../../lib/utils';
import { ApiClientError } from '../../lib/api';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

type LoginForm = z.infer<typeof loginSchema>;

const testimonialCredentials = [
  { email: 'admin@mvpponto.com', password: 'admin123', role: 'Admin' },
  { email: 'pedro@mvpponto.com', password: 'manager123', role: 'Gerente' },
  { email: 'joao@mvpponto.com', password: 'user123', role: 'Usuário' },
  { email: 'maria@mvpponto.com', password: 'user123', role: 'Usuário' }
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const [cooldown, setCooldown] = React.useState<number>(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  // Redirect se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err: any) {
      if (err instanceof ApiClientError && err.status === 429) {
        // Ativar cooldown com Retry-After se enviado, senão 30s padrão
        setCooldown(err.retryAfter && err.retryAfter > 0 ? err.retryAfter : 30);
      }
      // Demais erros já estão no store.error
    }
  };

  const fillCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  const isDisabled = isLoading || cooldown > 0;

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-xl">
            <CardHeader className="space-y-4 pb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/25">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              
              <div className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold text-gradient">
                  MvPPonto
                </CardTitle>
                <CardDescription className="text-base">
                  Entre na sua conta para continuar
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register('email')}
                  type="email"
                  label="Email"
                  placeholder="seu@email.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  disabled={isDisabled}
                />

                <Input
                  {...register('password')}
                  type="password"
                  label="Senha"
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  showPasswordToggle
                  disabled={isDisabled}
                />

                {(error || cooldown > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
                  >
                    {cooldown > 0 
                      ? `Muitas requisições. Tente novamente em ${cooldown}s.` 
                      : error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isLoading}
                  disabled={isDisabled}
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                >
                  {isLoading ? 'Entrando...' : cooldown > 0 ? `Aguarde ${cooldown}s` : 'Entrar'}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                  Credenciais de demonstração:
                </p>
                <div className="grid gap-2">
                  {testimonialCredentials.map((cred, index) => (
                    <motion.button
                      key={cred.email}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => fillCredentials(cred.email, cred.password)}
                      className="p-2 rounded-lg border border-border/50 hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-medium">{cred.email}</p>
                          <p className="text-xs text-muted-foreground">{cred.role}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{cred.password}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right Panel - Hero */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: [360, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight">
                Controle de Ponto
                <br />
                <span className="text-white/80">Inteligente</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed max-w-md">
                Gerencie horários, monitore produtividade e simplifique o controle de jornada da sua equipe.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Relatórios Avançados</h3>
                  <p className="text-white/70 text-sm">Analytics completos da equipe</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Gestão Simplificada</h3>
                  <p className="text-white/70 text-sm">Interface intuitiva para managers</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Registro em Tempo Real</h3>
                  <p className="text-white/70 text-sm">Marcação instantânea e precisa</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-2xl backdrop-blur-sm"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
          className="absolute bottom-32 left-20 w-24 h-24 bg-white/10 rounded-2xl backdrop-blur-sm"
        />
      </div>
    </div>
  );
};
