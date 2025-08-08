import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const cardVariants = cva(
  'rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm text-card-foreground transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'shadow-elegant hover:shadow-xl hover:border-border',
        glass: 'glass border-white/20 text-white',
        gradient: 'bg-gradient-to-br from-card to-card/80 shadow-xl',
        elevated: 'shadow-2xl hover:shadow-3xl bg-card border-border',
        outlined: 'border-2 border-border bg-transparent hover:bg-card/50',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hoverable: {
        true: 'hover:scale-[1.02] cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      hoverable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hoverable, className }))}
      {...props}
    />
  )
);

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { centerAlign?: boolean }
>(({ className, centerAlign, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5',
      centerAlign && 'items-center text-center',
      className
    )}
    {...props}
  />
));

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    gradient?: boolean;
  }
>(({ className, as: Comp = 'h3', gradient, ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      gradient && 'text-gradient',
      className
    )}
    {...props}
  />
));

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    justify?: 'start' | 'end' | 'center' | 'between' | 'around';
  }
>(({ className, justify = 'start', ...props }, ref) => {
  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center pt-6',
        justifyClasses[justify],
        className
      )}
      {...props}
    />
  );
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardFooter.displayName = 'CardFooter';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };