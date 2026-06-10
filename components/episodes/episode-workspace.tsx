'use client';

import Link from 'next/link';
import { ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { SceneList } from '@/components/scenes/scene-list';
import { ScriptPanel } from '@/components/episodes/script-panel';
import { useEpisodeOne, useVideos, useRenderFinal } from '@/lib/api/hooks';
import type { Episode, FinalVideo } from '@/lib/api/types';

const STATUS: Record<string, { label: string; dot: string }> = {
  DRAFT:        { label: '초안',      dot: 'bg-muted-foreground' },
  SCRIPT_READY: { label: '대본완료',  dot: 'bg-blue-500' },
  SCENE_READY:  { label: '씬완료',    dot: 'bg-purple-500' },
  VOICE_READY:  { label: '보이스완료',dot: 'bg-orange-500' },
  RENDERING:    { label: '렌더링중',  dot: 'bg-yellow-500 animate-pulse' },
  COMPLETED:    { label: '완료',      dot: 'bg-green-500' },
  FAILED:       { label: '실패',      dot: 'bg-red-500' },
};

interface Props { seriesId: string; episodeId: string }

export function EpisodeWorkspace({ seriesId, episodeId }: Props) {
  const { data, isLoading } = useEpisodeOne(episodeId);
  const episode = data as unknown as Episode;

  const { data: videosData } = useVideos(episodeId);
  const videos = (videosData as unknown as FinalVideo[]) ?? [];
  const latestVideo = videos[0];

  const renderMutation = useRenderFinal(episodeId);

  const handleFinalRender = async () => {
    try {
      await renderMutation.mutateAsync();
      toast.success('최종 렌더링 시작됐어요');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? '렌더링 실패');
    }
  };

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64 rounded-lg" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );

  const st = episode?.status ? STATUS[episode.status] : null;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href={`/series/${seriesId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0">
              EP {String(episode?.episodeNumber ?? '').padStart(2, '0')}
            </span>
            <h1 className="font-bold text-lg truncate">{episode?.title}</h1>
          </div>
          {st && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${st.dot}`} />
              <span className="text-xs text-muted-foreground">{st.label}</span>
            </div>
          )}
        </div>

        {latestVideo?.status === 'COMPLETED' && latestVideo.videoUrl ? (
          <a href={latestVideo.videoUrl} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="gap-1.5 h-9 shrink-0">
              <ExternalLink className="h-3.5 w-3.5" /> 영상 보기
            </Button>
          </a>
        ) : (
          <Button size="sm" onClick={handleFinalRender} disabled={renderMutation.isPending} className="gap-1.5 h-9 shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 ${renderMutation.isPending ? 'animate-spin' : ''}`} />
            {renderMutation.isPending ? '처리중...' : '최종 렌더링'}
          </Button>
        )}
      </div>

      {/* 탭 */}
      <Tabs defaultValue="scenes">
        <TabsList className="h-9">
          <TabsTrigger value="scenes" className="text-sm">씬 목록</TabsTrigger>
          <TabsTrigger value="script" className="text-sm">대본</TabsTrigger>
        </TabsList>
        <TabsContent value="scenes" className="mt-5">
          <SceneList episodeId={episodeId} />
        </TabsContent>
        <TabsContent value="script" className="mt-5">
          <ScriptPanel episodeId={episodeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
