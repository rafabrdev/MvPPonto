import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, getInitials, getColorFromString } from '../../lib/utils';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-background',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        default: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
        '3xl': 'h-24 w-24',
      },
      variant: {
        default: '',
        gradient: 'ring-gradient-to-r from-primary-500 to-primary-600',
        glow: 'ring-primary-500/50 ring-4 shadow-lg shadow-primary-500/25',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

const statusVariants = cva(
  'absolute bottom-0 right-0 rounded-full ring-2 ring-background',
  {
    variants: {
      size: {
        sm: 'h-2 w-2',
        default: 'h-3 w-3',
        lg: 'h-3.5 w-3.5',
        xl: 'h-4 w-4',
        '2xl': 'h-5 w-5',
        '3xl': 'h-6 w-6',
      },
      status: {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        working: 'bg-blue-500',
        lunch: 'bg-yellow-500',
        away: 'bg-orange-500',
      },
    },
  }
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
  status?: 'online' | 'offline' | 'working' | 'lunch' | 'away';
  showStatus?: boolean;
  fallbackColor?: string;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ 
  className, 
  src, 
  alt, 
  name = '',
  size, 
  variant,
  status,
  showStatus = false,
  fallbackColor,
  ...props 
}, ref) => {
  const initials = getInitials(name);
  const bgColor = fallbackColor || getColorFromString(name);

  return (
    <div className="relative inline-flex">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, variant, className }))}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={alt || name}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className={cn(
            'flex h-full w-full items-center justify-center text-white font-semibold',
            bgColor
          )}
        >
          {initials || name.charAt(0).toUpperCase() || '?'}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      
      {showStatus && status && (
        <div
          className={cn(statusVariants({ size, status }))}
          title={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      )}
    </div>
  );
});

const AvatarGroup: React.FC<{
  children: React.ReactNode;
  max?: number;
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}> = ({ children, max = 4, spacing = 'normal', className }) => {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  const spacingClasses = {
    tight: '-space-x-2',
    normal: '-space-x-1',
    loose: 'space-x-1',
  };

  return (
    <div className={cn('flex items-center', spacingClasses[spacing], className)}>
      {visibleAvatars}
      {remainingCount > 0 && (
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

Avatar.displayName = AvatarPrimitive.Root.displayName;

export { Avatar, AvatarGroup };