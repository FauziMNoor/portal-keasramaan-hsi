'use client';

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  illustration?: ReactNode;
  variant?: 'default' | 'compact';
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration,
  variant = 'default',
}: EmptyStateProps) {
  const ActionIcon = action?.icon;
  
  if (variant === 'compact') {
    return (
      <div className="empty-state py-8 animate-fade-in-up">
        <Icon className="w-12 h-12 text-gray-400 mb-3" />
        <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3 max-w-sm">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="btn-primary inline-flex items-center gap-2"
          >
            {ActionIcon && <ActionIcon className="w-4 h-4" />}
            {action.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="empty-state animate-fade-in-up">
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : (
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-linear-to-br from-blue-50 to-indigo-50 rounded-full opacity-50 animate-pulse"></div>
          </div>
          <Icon className="empty-state-icon relative z-10" />
        </div>
      )}
      
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary inline-flex items-center gap-2 hover-lift"
        >
          {ActionIcon && <ActionIcon className="w-5 h-5" />}
          {action.label}
        </button>
      )}
    </div>
  );
}

// Illustration components for common scenarios
export function NoDataIllustration() {
  return (
    <svg
      className="w-32 h-32 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export function NoResultsIllustration() {
  return (
    <svg
      className="w-32 h-32 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export function ErrorIllustration() {
  return (
    <svg
      className="w-32 h-32 text-red-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

export function SuccessIllustration() {
  return (
    <svg
      className="w-32 h-32 text-green-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
