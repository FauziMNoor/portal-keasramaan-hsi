'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} ${colorClasses[variant]} border-4 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      ></div>
      {text && (
        <p className={`text-sm font-medium ${variant === 'white' ? 'text-white' : 'text-gray-700'} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 animate-fade-in">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Inline spinner for buttons
export function ButtonSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div
      className={`${sizeClass} border-2 border-white border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    ></div>
  );
}

// Dots spinner variant
export function DotsSpinner({ variant = 'primary' }: { variant?: 'primary' | 'white' | 'gray' }) {
  const colorClasses = {
    primary: 'bg-blue-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
  };

  return (
    <div className="flex items-center gap-1" role="status" aria-label="Loading">
      <div className={`w-2 h-2 ${colorClasses[variant]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`w-2 h-2 ${colorClasses[variant]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`w-2 h-2 ${colorClasses[variant]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}
