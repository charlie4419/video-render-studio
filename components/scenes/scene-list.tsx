'use client';

import { useState } from 'react';
import { ImageIcon, Mic, Video, Film, RefreshCw, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScenePipeline } from './scene-pipeline';
import {
  useSceneList,
  useGenerateSceneImage,
  useGenerateTts,
  useGenerateAnimation,
  useRenderClip,
} from '@/lib/api/hooks';
import type { Scene } from '@/lib/api/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Props { episodeId: string }

const STEPS = [
  { key: 'image',   icon: ImageIcon, label: '이미지' },
  { key: 'tts',     icon: Mic,       label: 'TTS' },
  { key: 'animate', icon: Video,     label: '애니' },
  { key: 'render',  icon: Film,      label: '클립' },
];

function stepDone(scene: Scene, key: string) {
  if (key === 'image')   return scene.status !== 'PENDING';
  if (key === 'tts')     return ['TTS_READY', 'VIDEO_READY', 'DONE'].includes(scene.status);
  if (key === 'animate') return ['VIDEO_READY', 'DONE'].includes(scene.status);
  if (key === 'render')  return scene.status === 'DONE';
  return false;
}

export function SceneList({ episodeId }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const { data, isLoading, refetch } = useSceneList(episodeId);
  const scenes = (data as unknown as Scene[]) ?? [];

  const imageMutation    = useGenerateSceneImage();
  const ttsMutation      = useGenerateTts();
  const animateMutation  = useGenerateAnimation();
  const renderMutation   = useRenderClip();

  const isBusy = (sceneId: string, type: string) => {
    if (type === 'image')   return imageMutation.isPending   && (imageMutation.variables   as any)?.sceneId === sceneId;
    if (type === 'tts')     return ttsMutation.isPending     && (ttsMutation.variables     as any)?.sceneId === sceneId;
    if (type === 'animate') return animateMutation.isPending && (animateMutation.variables as any)?.sceneId === sceneId;
    if (type === 'render')  return renderMutation.isPending  && (renderMutation.variables  as any)?.sceneId === sceneId;
    return false;
  };

  const handleGenerateImage = async (sceneId: string, prompt?: string) => {
    try {
      await imageMutation.mutateAsync({ sceneId, dto: prompt ? { prompt } : {} });
      toast.success('이미지 생성 요청됐어요');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? '이미지 생성 실패'); }
  };

  const handleGenerateTts = async (sceneId: string) => {
    try {
      await ttsMutation.mutateAsync({ sceneId, dto: {} });
      toast.success('TTS 생성 요청됐어요');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'TTS 생성 실패'); }
  };

  const handleAnimate = async (sceneId: string, opts?: { motionPrompt?: string; duration?: 5 | 10 }) => {
    try {
      await animateMutation.mutateAsync({ sceneId, dto: opts ?? {} });
      toast.success('애니메이션 생성 요청됐어요');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? '애니메이션 생성 실패'); }
  };

  const handleRender = async (sceneId: string) => {
    try {
      await renderMutation.mutateAsync({ sceneId, dto: {} });
      toast.success('렌더링 요청됐어요');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? '렌더링 실패'); }
  };

  if (isLoading) return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
    </div>
  );

  if (scenes.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
        <Film className="h-8 w-8 opacity-40" />
      </div>
      <div className="text-center">
        <p className="font-medium">씬이 없어요</p>
        <p className="text-sm mt-1 opacity-70">대본 탭에서 대본을 먼저 생성하세요</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-muted-foreground">{scenes.length}개 씬</span>
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs text-muted-foreground" onClick={() => refetch()}>
          <RefreshCw className="h-3 w-3" /> 새로고침
        </Button>
      </div>

      {scenes.map((scene) => {
        const isOpen = expanded === scene.id;
        const dialogue = scene.dialogueJson
          ? (() => { try { return JSON.parse(scene.dialogueJson); } catch { return []; } })()
          : [];
        const doneCount = STEPS.filter(s => stepDone(scene, s.key)).length;

        return (
          <div key={scene.id} className="border rounded-xl overflow-hidden bg-card transition-shadow hover:shadow-sm">
            {/* 씬 행 */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : scene.id)}
            >
              {/* 순서 번호 */}
              <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-muted-foreground">{scene.order}</span>
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">
                  {scene.background ?? '(배경 없음)'}
                </p>
                {dialogue.length > 0 && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {dialogue.slice(0, 2).map((d: any) => `${d.character}: ${d.text}`).join('  ·  ')}
                  </p>
                )}
              </div>

              {/* 파이프라인 진행 상태 */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {STEPS.map(({ key, icon: Icon, label }) => {
                  const done = stepDone(scene, key);
                  const busy = isBusy(scene.id, key);
                  return (
                    <div key={key} title={label}
                      className={`flex items-center justify-center h-6 w-6 rounded-md transition-colors ${
                        busy ? 'bg-amber-100 text-amber-600 animate-pulse' :
                        done ? 'bg-green-100 text-green-600' :
                               'bg-muted/60 text-muted-foreground/50'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                  );
                })}
                {doneCount > 0 && (
                  <span className="ml-1 text-[10px] text-muted-foreground font-medium w-6 text-center">
                    {doneCount}/4
                  </span>
                )}
              </div>

              {/* 편집 버튼 */}
              <button
                className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0"
                title="씬 편집"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(scene.id);
                  setExpanded(scene.id);
                }}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {/* 토글 */}
              <div className="shrink-0 text-muted-foreground">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>

            {/* 파이프라인 펼침 */}
            {isOpen && (
              <div className="border-t bg-muted/20 px-4 py-5">
                <ScenePipeline
                  scene={scene}
                  episodeId={episodeId}
                  apiUrl={API_URL}
                  editOpen={editing === scene.id}
                  onEditClose={() => setEditing(null)}
                  busyImage={isBusy(scene.id, 'image')}
                  busyTts={isBusy(scene.id, 'tts')}
                  busyAnimate={isBusy(scene.id, 'animate')}
                  busyRender={isBusy(scene.id, 'render')}
                  onGenerateImage={(opts) => handleGenerateImage(scene.id, opts?.prompt)}
                  onGenerateTts={() => handleGenerateTts(scene.id)}
                  onAnimate={(opts) => handleAnimate(scene.id, opts)}
                  onRender={() => handleRender(scene.id)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
