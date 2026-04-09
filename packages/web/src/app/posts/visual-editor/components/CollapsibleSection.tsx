'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  subtitle?: string;
  children: ReactNode;
}

export function CollapsibleSection({ title, icon, defaultOpen = false, subtitle, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 px-1 text-left group"
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-text-muted flex-shrink-0">{icon}</span>}
          <span className="text-[13px] font-bold text-text-primary truncate">{title}</span>
          {subtitle && <span className="text-[10px] text-text-muted truncate">{subtitle}</span>}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform flex-shrink-0 ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open && <div className="pb-4 px-1 space-y-3">{children}</div>}
    </div>
  );
}
