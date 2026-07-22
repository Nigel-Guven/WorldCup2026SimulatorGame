import type { ReactNode } from 'react';

interface BracketRoundColumnProps {
  title: string;
  titleColorClass?: string;
  spacingClass?: string;
  children: ReactNode;
}

export function BracketRoundColumn({
  title,
  titleColorClass = 'text-slate-400',
  spacingClass = 'space-y-4',
  children,
}: BracketRoundColumnProps) {
  return (
    <div className="space-y-4">
      <h3
        className={`text-xs font-mono font-bold text-center uppercase tracking-widest mb-4 ${titleColorClass}`}
      >
        {title}
      </h3>
      <div className={spacingClass}>{children}</div>
    </div>
  );
}