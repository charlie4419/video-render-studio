'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: '시리즈', icon: Layers },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r bg-muted/30 flex flex-col min-h-screen py-6 px-3 gap-1">
      <div className="flex items-center gap-2 px-3 mb-6">
        <Film className="h-6 w-6 text-primary" />
        <span className="font-bold text-base tracking-tight">Render Studio</span>
      </div>

      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === href || (href !== '/' && pathname.startsWith(href))
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </aside>
  );
}
