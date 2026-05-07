import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * EmptyState Component
 * 
 * A reusable component for displaying empty states throughout the application.
 * Features a premium design with icons, gradients, and optional action buttons.
 * 
 * **Validates: Requirements 6.1, 8.1, 11.4**
 */

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-6',
      iconWrapper: 'w-12 h-12',
      icon: 'w-6 h-6',
      title: 'text-base',
      description: 'text-xs',
    },
    md: {
      container: 'py-12',
      iconWrapper: 'w-16 h-16',
      icon: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      iconWrapper: 'w-20 h-20',
      icon: 'w-10 h-10',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        classes.container,
        className
      )}
    >
      {/* Icon with gradient background */}
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 shadow-sm',
          classes.iconWrapper
        )}
      >
        <Icon className={cn('text-gray-500', classes.icon)} />
      </div>

      {/* Title */}
      <h3 className={cn('font-semibold text-gray-900 mb-2', classes.title)}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn('text-gray-500 max-w-sm mb-6', classes.description)}>
        {description}
      </p>

      {/* Optional Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
