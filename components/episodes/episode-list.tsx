'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Clapperboard, Trash2, ChevronRight, Users, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSeriesOne, useEpisodeList, useCreateEpisode, useDeleteEpisode, useUpdateSeries } from '@/lib/api/hooks';
import { CharacterPanel } from '@/components/characters/character-panel';
import type { Series, Episode } from '@/lib/api/types';

const STATUS: Record<string, { label: string; className: string }> = {
  DRAFT:        { label: '초안',      className: 'bg-muted text-muted-foreground' },
  SCRIPT_READY: { label: '대본완료',  className: 'bg-blue-50 text-blue-700' },
  SCENE_READY:  { label: '씬완료',    className: 'bg-purple-50 text-purple-700' },
  VOICE_READY:  { label: '보이스완료',className: 'bg-orange-50 text-orange-700' },
  RENDERING:    { label: '렌더링중',  className: 'bg-yellow-50 text-yellow-700' },
  COMPLETED:    { label: '완료',      className: 'bg-green-50 text-green-700' },
  FAILED:       { label: '실패',      className: 'bg-red-50 text-red-700' },
};

interface Props { seriesId: string }

export function EpisodeList({ seriesId }: Props) {
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ title: '', episodeNumber: '' });
  const [formatPrompt, setFormatPrompt] = useState('');
  const [formatPromptLoaded, setFormatPromptLoaded] = useState(false);

  const { data: seriesData } = useSeriesOne(seriesId);
  const series = seriesData as unknown as Series;

  // 설정 탭이 처음 렌더될 때 DB 값으로 초기화
  if (series && !formatPromptLoaded) {
    setFormatPrompt(series.formatPrompt ?? '');
    setFormatPromptLoaded(true);
  }

  const { data, isLoading } = useEpisodeList(seriesId);
  const episodes = (data as unknown as Episode[]) ?? [];

  const createMutation = useCreateEpisode(seriesId);
  const deleteMutation = useDeleteEpisode(seriesId);
  const updateSeriesMutation = useUpdateSeries(seriesId);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await createMutation.mutateAsync({
        title: form.title,
        episodeNumber: form.episodeNumber ? Number(form.episodeNumber) : episodes.length + 1,
      });
      toast.success('에피소드 생성됐어요');
      setForm({ title: '', episodeNumber: '' });
      setOpenCreate(false);
    } catch {
      toast.error('생성 실패');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 에피소드를 삭제할까요?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('삭제됐어요');
    } catch {
      toast.error('삭제 실패');
    }
  };

  const handleSaveFormatPrompt = async () => {
    try {
      await updateSeriesMutation.mutateAsync({ formatPrompt });
      toast.success('저장됐어요');
    } catch {
      toast.error('저장 실패');
    }
  };

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-start gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-9 w-9 mt-0.5 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{series?.title ?? '...'}</h1>
          {series?.description && (
            <p className="text-muted-foreground text-sm mt-1">{series.description}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="episodes">
        <div className="flex items-center justify-between mb-5">
          <TabsList className="h-9">
            <TabsTrigger value="episodes" className="gap-1.5 text-sm">
              <Clapperboard className="h-3.5 w-3.5" />
              에피소드
              {episodes.length > 0 && (
                <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none">
                  {episodes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-1.5 text-sm">
              <Users className="h-3.5 w-3.5" />
              캐릭터
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-sm">
              <Settings className="h-3.5 w-3.5" />
              설정
            </TabsTrigger>
          </TabsList>
          <Button size="sm" className="gap-1.5 h-9" onClick={() => setOpenCreate(true)}>
            <Plus className="h-4 w-4" /> 에피소드 추가
          </Button>
        </div>

        <TabsContent value="episodes" className="mt-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : episodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <Clapperboard className="h-8 w-8 opacity-40" />
              </div>
              <div className="text-center">
                <p className="font-medium">에피소드가 없어요</p>
                <p className="text-sm mt-1 opacity-70">첫 에피소드를 만들어보세요</p>
              </div>
              <Button onClick={() => setOpenCreate(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> 에피소드 추가
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {episodes.map((ep) => {
                const st = STATUS[ep.status] ?? { label: ep.status, className: 'bg-muted text-muted-foreground' };
                return (
                  <div key={ep.id} className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all">
                    {/* 에피소드 번호 */}
                    <div className="h-12 w-12 rounded-xl bg-muted flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">EP</span>
                      <span className="text-lg font-bold leading-tight">{String(ep.episodeNumber).padStart(2, '0')}</span>
                    </div>

                    {/* 제목/설명 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{ep.title}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${st.className}`}>
                          {st.label}
                        </span>
                      </div>
                      {ep.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{ep.description}</p>
                      )}
                    </div>

                    {/* 액션 */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(ep.id, ep.title)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Link href={`/series/${seriesId}/episodes/${ep.id}`}>
                        <Button size="sm" className="gap-1 h-8 text-xs">
                          작업하기 <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="characters" className="mt-0">
          <CharacterPanel seriesId={seriesId} />
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <div className="max-w-2xl space-y-4">
            <div className="space-y-1.5">
              <Label>시리즈 제작 규칙 (AI 프롬프트)</Label>
              <p className="text-xs text-muted-foreground">씬 생성 시 AI에게 전달되는 시리즈 전용 지시사항입니다.</p>
              <Textarea
                rows={12}
                value={formatPrompt}
                onChange={(e) => setFormatPrompt(e.target.value)}
                placeholder="예: 씬 구성, 대사 원칙, 서사 흐름 등 시리즈에 특화된 AI 지시사항을 입력하세요."
                className="font-mono text-sm"
              />
            </div>
            <Button onClick={handleSaveFormatPrompt} disabled={updateSeriesMutation.isPending}>
              {updateSeriesMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>에피소드 추가</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="epTitle">제목 *</Label>
              <Input id="epTitle" placeholder="예: 에반의 첫 번째 모험" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="epNum">에피소드 번호</Label>
              <Input id="epNum" type="number" placeholder={String(episodes.length + 1)}
                value={form.episodeNumber} onChange={(e) => setForm({ ...form, episodeNumber: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpenCreate(false)}>취소</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? '생성 중...' : '만들기'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
