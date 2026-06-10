'use client';

import { Film } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <Film className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm">Render Studio</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-xs text-muted-foreground">AI 쇼츠 영상 제작</span>
      </div>
    </header>
  );
}
