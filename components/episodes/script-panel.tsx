'use client';

import { useState } from 'react';
import { Wand2, CheckCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useScripts, useGenerateScript, useUpdateScript, useGenerateScenes } from '@/lib/api/hooks';
import type { Script } from '@/lib/api/types';

interface Props { episodeId: string }

export function ScriptPanel({ episodeId }: Props) {
  const [promptInput, setPromptInput] = useState('');
  const [editContent, setEditContent] = useState<Record<string, string>>({});
  const [regenMode, setRegenMode] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const { data, isLoading } = useScripts(episodeId);
  const scripts = (data as unknown as Script[]) ?? [];
  const latestScript = scripts[0];

  const generateMutation = useGenerateScript(episodeId);
  const updateMutation   = useUpdateScript(episodeId);
  const scenesMutation   = useGenerateScenes(episodeId);

  const doGenerate = async () => {
    setConfirmRegen(false);
    try {
      await generateMutation.mutateAsync(promptInput ? { prompt: promptInput } : {});
      toast.success('대본 생성됐어요');
      setRegenMode(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? '생성 실패');
    }
  };

  // 재생성 버튼 클릭 → 프롬프트 입력 화면으로 이동 (기존 프롬프트 pre-fill)
  const handleClickRegen = () => {
    setPromptInput(latestScript?.prompt ?? '');
    setRegenMode(true);
  };

  const handleApprove = async (scriptId: string) => {
    try {
      const content = editContent[scriptId] ?? latestScript?.content ?? '';
      await updateMutation.mutateAsync({ id: scriptId, dto: { content, status: 'APPROVED' } });
      toast.success('대본 승인됐어요');
    } catch { toast.error('승인 실패'); }
  };

  const handleGenerateScenes = async (scriptId: string) => {
    try {
      // 수정된 content가 있으면 먼저 저장
      if (editContent[scriptId] !== undefined) {
        await updateMutation.mutateAsync({ id: scriptId, dto: { content: editContent[scriptId] } });
      }
      await scenesMutation.mutateAsync(scriptId);
      toast.success('씬 재생성 시작됐어요');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? '씬 생성 실패');
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  const showPromptForm = !latestScript || regenMode;

  return (
    <div className="space-y-5">

      {/* 재생성 확인 다이얼로그 */}
      <Dialog open={confirmRegen} onOpenChange={setConfirmRegen}>
        <DialogContent>
          <DialogHeader><DialogTitle>대본 재생성</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            재생성하면 기존 대본과 씬이 모두 초기화됩니다. 계속할까요?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRegen(false)}>취소</Button>
            <Button variant="destructive" onClick={doGenerate} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? '생성 중...' : '재생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showPromptForm ? (
        /* ── 프롬프트 입력 화면 ── */
        <div className="space-y-3">
          {regenMode && (
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setRegenMode(false)}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> 대본으로 돌아가기
            </button>
          )}
          <div className="space-y-1.5">
            <Label>{regenMode ? '지시사항 수정 후 재생성' : '스토리 개요 / 지시사항'}</Label>
            <Textarea
              className="min-h-[280px] resize-y text-sm leading-relaxed"
              placeholder={`어떤 내용의 쇼츠를 만들고 싶은지 자유롭게 써주세요.\n\n예시)\n- 주인공: 스마티 (초등학생, 호기심 많음)\n- 배경: 학교 복도\n- 내용: 친구가 넘어지는 걸 보고 도와주는 이야기\n- 분위기: 따뜻하고 유머러스하게\n- 반전: 알고보니 친구가 일부러 넘어진 것`}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
            />
          </div>
          <Button
            onClick={() => regenMode ? setConfirmRegen(true) : doGenerate()}
            disabled={generateMutation.isPending}
            className="gap-2"
          >
            <Wand2 className="h-4 w-4" />
            {generateMutation.isPending ? '생성 중...' : regenMode ? 'AI 대본 재생성' : 'AI 대본 생성'}
          </Button>
        </div>
      ) : (
        /* ── 생성된 대본 화면 ── */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">생성된 대본</span>
              {latestScript.status === 'APPROVED' && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 rounded-full px-2 py-0.5">
                  <CheckCircle className="h-3 w-3" /> 승인됨
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost" size="sm"
                className="gap-1.5 h-8 text-xs text-muted-foreground"
                onClick={handleClickRegen}
                disabled={generateMutation.isPending}
              >
                <RotateCcw className="h-3.5 w-3.5" /> 재생성
              </Button>
              {latestScript.status !== 'APPROVED' && (
                <Button size="sm" className="h-8 text-xs gap-1.5"
                  onClick={() => handleApprove(latestScript.id)} disabled={updateMutation.isPending}>
                  <CheckCircle className="h-3.5 w-3.5" />
                  {updateMutation.isPending ? '저장 중...' : '승인'}
                </Button>
              )}
              {latestScript.status === 'APPROVED' && (
                <Button size="sm" className="h-8 text-xs gap-1.5"
                  onClick={() => handleGenerateScenes(latestScript.id)} disabled={scenesMutation.isPending}>
                  <Wand2 className="h-3.5 w-3.5" />
                  {scenesMutation.isPending ? '생성 중...' : '씬 재생성'}
                </Button>
              )}
            </div>
          </div>

          {/* 원본 지시사항 */}
          {latestScript.prompt && (
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">입력한 지시사항</p>
              <p className="text-sm whitespace-pre-wrap text-foreground/70">{latestScript.prompt}</p>
            </div>
          )}

          {/* 대본 */}
          <Textarea
            className="min-h-[400px] text-sm font-mono leading-relaxed resize-y"
            value={editContent[latestScript.id] ?? latestScript.content ?? ''}
            onChange={(e) => setEditContent({ ...editContent, [latestScript.id]: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
