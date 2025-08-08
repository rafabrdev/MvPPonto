import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

const inputVariants = cva(
  'flex w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'hover:border-ring/20',
        error: 'border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus-visible:ring-green-500',
        glass: 'glass border-white/20 text-white placeholder:text-white/70',
      },
      inputSize: {
        sm: 'h-9 px-3 text-xs',
        default: 'h-12',
        lg: 'h-14 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    inputSize,
    type,
    label,
    helperText,
    error,
    success,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    
    // Determinar variante baseada no estado
    const currentVariant = error ? 'error' : success ? 'success' : variant;
    
    const statusIcon = error ? (
      <AlertCircle className="h-4 w-4 text-red-500" />
    ) : success ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : null;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error ? 'text-red-500' : success ? 'text-green-500' : 'text-foreground'
          )}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: currentVariant, inputSize }),
              leftIcon && 'pl-10',
              (rightIcon || statusIcon || (isPassword && showPasswordToggle)) && 'pr-10',
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {statusIcon}
            {rightIcon && !statusIcon}
            
            {isPassword && showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {(helperText || error || success) && (
          <p className={cn(
            'text-xs',
            error ? 'text-red-500' : success ? 'text-green-500' : 'text-muted-foreground'
          )}>
            {error || success || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };