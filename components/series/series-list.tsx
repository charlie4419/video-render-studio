'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Film, Trash2, ChevronRight, Clapperboard, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateSeriesDialog } from './create-series-dialog';
import { useSeriesList, useDeleteSeries } from '@/lib/api/hooks';
import type { Series } from '@/lib/api/types';

const CARD_COLORS = [
  'from-violet-500/20 to-purple-500/10 border-violet-200/50',
  'from-blue-500/20 to-cyan-500/10 border-blue-200/50',
  'from-rose-500/20 to-pink-500/10 border-rose-200/50',
  'from-amber-500/20 to-orange-500/10 border-amber-200/50',
  'from-emerald-500/20 to-teal-500/10 border-emerald-200/50',
];

const ICON_COLORS = [
  'text-violet-500',
  'text-blue-500',
  'text-rose-500',
  'text-amber-500',
  'text-emerald-500',
];

export function SeriesList() {
  const [openCreate, setOpenCreate] = useState(false);
  const { data, isLoading } = useSeriesList();
  const series = (data as unknown as Series[]) ?? [];
  const deleteMutation = useDeleteSeries();

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`"${title}" 시리즈를 삭제할까요?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('삭제됐어요');
    } catch {
      toast.error('삭제 실패');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {series.map((s, idx) => {
          const colorClass = CARD_COLORS[idx % CARD_COLORS.length];
          const iconColor = ICON_COLORS[idx % ICON_COLORS.length];
          return (
            <Link key={s.id} href={`/series/${s.id}`} className="group">
              <div className={`relative flex flex-col rounded-2xl border bg-gradient-to-br ${colorClass} p-5 pb-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}>

                {/* 아이콘 + 삭제 */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-white/60 backdrop-blur-sm ${iconColor}`}>
                    <Film className="h-5 w-5" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, s.id, s.title)}
                    className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-white/60 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* 제목 + 설명 */}
                <div className="flex-1">
                  <h3 className="font-bold text-base leading-tight mb-1">{s.title}</h3>
                  {s.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{s.description}</p>
                  )}
                  {s.stylePrompt && (
                    <div className="flex items-center gap-1 mt-2">
                      <Sparkles className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                      <p className="text-xs text-muted-foreground/70 line-clamp-1 italic">{s.stylePrompt}</p>
                    </div>
                  )}
                </div>

                {/* 하단 */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/30">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clapperboard className="h-3.5 w-3.5" />
                    <span>에피소드 보기</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                    작업하기 <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

              </div>
            </Link>
          );
        })}

        {/* 새 시리즈 추가 카드 */}
        <button
          onClick={() => setOpenCreate(true)}
          className="flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/20 transition-all duration-200 gap-3 text-muted-foreground hover:text-primary group"
        >
          <div className="p-3 rounded-xl border-2 border-dashed border-current transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">새 시리즈 만들기</span>
        </button>
      </div>

      <CreateSeriesDialog open={openCreate} onOpenChange={setOpenCreate} />
    </>
  );
}
