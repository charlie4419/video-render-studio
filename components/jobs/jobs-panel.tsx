'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useJobs, useQueueStats } from '@/lib/api/hooks';
import type { GenerationJob, QueueStats } from '@/lib/api/types';

const STATUS_COLOR: Record<string, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  PENDING: 'secondary',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  FAILED: 'destructive',
  CANCELLED: 'secondary',
};

const JOB_TYPE_LABEL: Record<string, string> = {
  SCENE_IMAGE: '씬 이미지',
  TTS: 'TTS',
  IMAGE_TO_VIDEO: '애니메이션',
  VIDEO_RENDER: '씬 렌더',
  FINAL_RENDER: '최종 렌더',
  CHARACTER_IMAGE: '캐릭터 이미지',
};

export function JobsPanel() {
  const { data: jobsData, isLoading, refetch } = useJobs();
  const { data: statsData } = useQueueStats();

  const jobs = (jobsData as unknown as { items: GenerationJob[]; total: number }) ?? { items: [], total: 0 };
  const stats = statsData as unknown as QueueStats;

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(stats).map(([queue, stat]) => (
            <Card key={queue} className="text-sm">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-xs text-muted-foreground font-normal">{queue}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-0.5">
                <p>대기 <span className="font-semibold">{stat.waiting}</span></p>
                <p>진행 <span className="font-semibold text-blue-600">{stat.active}</span></p>
                <p>완료 <span className="font-semibold text-green-600">{stat.completed}</span></p>
                <p>실패 <span className="font-semibold text-red-600">{stat.failed}</span></p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground">총 {jobs.total ?? 0}개</span>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" /> 새로고침
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {(jobs.items ?? []).map((job) => (
              <div key={job.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-card text-sm">
                <Badge variant={STATUS_COLOR[job.status] ?? 'secondary'} className="text-xs shrink-0 w-16 justify-center">
                  {job.status}
                </Badge>
                <span className="text-muted-foreground shrink-0 w-24 text-xs">
                  {JOB_TYPE_LABEL[job.type] ?? job.type}
                </span>
                <span className="truncate text-xs text-muted-foreground flex-1">{job.targetId}</span>
                {job.progress > 0 && job.progress < 100 && (
                  <span className="text-xs text-blue-600 shrink-0">{job.progress}%</span>
                )}
                {job.error && (
                  <span className="text-xs text-destructive truncate max-w-40 shrink-0" title={job.error}>
                    {job.error}
                  </span>
                )}
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(job.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
