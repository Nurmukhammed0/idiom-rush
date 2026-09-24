import type { ReactNode } from 'react';

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
