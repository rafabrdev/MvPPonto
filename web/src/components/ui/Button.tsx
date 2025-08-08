import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] hover:from-primary-700 hover:to-primary-800',
        destructive:
          'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] hover:from-red-700 hover:to-red-800',
        success:
          'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] hover:from-green-700 hover:to-green-800',
        outline:
          'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 hover:scale-[1.02]',
        secondary:
          'bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 hover:shadow-lg hover:scale-[1.02]',
        ghost: 'hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]',
        link: 'text-primary underline-offset-4 hover:underline hover:scale-[1.02]',
        glass:
          'glass text-white border-white/20 shadow-glass hover:bg-white/10 hover:scale-[1.02]',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-14 rounded-xl px-8 text-base',
        xl: 'h-16 rounded-2xl px-10 text-lg font-bold',
        icon: 'h-12 w-12',
        'icon-sm': 'h-9 w-9',
        'icon-lg': 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        {children && (
          <span className={cn(
            'truncate',
            loading && 'ml-2'
          )}>
            {children}
          </span>
        )}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };