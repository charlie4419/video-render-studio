'use client';

import { useState } from 'react';
import { Wand2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useScripts, useGenerateScript, useUpdateScript, useGenerateScenes } from '@/lib/api/hooks';
import type { Script } from '@/lib/api/types';

interface Props { episodeId: string }

export function ScriptPanel({ episodeId }: Props) {
  const [editContent, setEditContent] = useState<Record<string, string>>({});
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [promptInput, setPromptInput] = useState('');

  const { data, isLoading } = useScripts(episodeId);
  const scripts = (data as unknown as Script[]) ?? [];
  const latestScript = scripts[0];

  // content가 짧거나 placeholder면 prompt 필드를 표시
  const displayContent = (script: Script) => {
    const c = script.content ?? '';
    if (c.length < 20) return script.prompt ?? c;
    return c;
  };

  const generateMutation = useGenerateScript(episodeId);
  const updateMutation = useUpdateScript(episodeId);
  const scenesMutation = useGenerateScenes(episodeId);

  const doGenerate = async () => {
    setConfirmRegen(false);
    try {
      await generateMutation.mutateAsync(promptInput ? { prompt: promptInput } : {});
      toast.success('대본 생성됐어요');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? '생성 실패');
    }
  };

  const handleGenerate = () => {
    if (latestScript) {
      setConfirmRegen(true);
    } else {
      doGenerate();
    }
  };

  const handleApprove = async (scriptId: string) => {
    try {
      const content = editContent[scriptId] ?? latestScript?.content ?? '';
      await updateMutation.mutateAsync({ id: scriptId, dto: { content, status: 'APPROVED' } });
      toast.success('대본 승인됐어요');
    } catch {
      toast.error('승인 실패');
    }
  };

  const handleGenerateScenes = async (scriptId: string) => {
    try {
      await scenesMutation.mutateAsync(scriptId);
      toast.success('씬 생성됐어요! 씬 목록 탭에서 확인하세요');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? '씬 생성 실패');
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div className="space-y-4">
      {/* 생성 프롬프트 입력 */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">생성 지시사항 (선택)</Label>
        <Input
          placeholder="예: 유머러스하게, 10대 타겟, 마지막에 반전 포함..."
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          className="text-sm"
        />
      </div>

      <Dialog open={confirmRegen} onOpenChange={setConfirmRegen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>대본 재생성</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            대본을 재생성하면 기존 씬 목록이 모두 초기화됩니다. 계속할까요?
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmRegen(false)}>취소</Button>
            <Button variant="destructive" onClick={doGenerate} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? '생성 중...' : '재생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {!latestScript ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Wand2 className="h-10 w-10 opacity-30" />
          <p>대본이 없어요. GPT로 자동 생성해보세요!</p>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
            <Wand2 className="h-4 w-4 mr-1" />
            {generateMutation.isPending ? '생성 중...' : 'GPT 대본 생성'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">대본</span>
              {latestScript.status === 'APPROVED' && (
                <Badge variant="default" className="text-xs gap-1">
                  <CheckCircle className="h-3 w-3" /> 승인됨
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generateMutation.isPending}>
                <Wand2 className="h-3.5 w-3.5 mr-1" />
                {generateMutation.isPending ? '생성 중...' : '재생성'}
              </Button>
              {latestScript.status !== 'APPROVED' && (
                <Button size="sm" onClick={() => handleApprove(latestScript.id)} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? '저장 중...' : '승인'}
                </Button>
              )}
              {latestScript.status === 'APPROVED' && (
                <Button size="sm" onClick={() => handleGenerateScenes(latestScript.id)} disabled={scenesMutation.isPending}>
                  {scenesMutation.isPending ? '생성 중...' : '씬 생성'}
                </Button>
              )}
            </div>
          </div>
          <Textarea
            className="min-h-[400px] text-sm font-mono"
            value={editContent[latestScript.id] ?? displayContent(latestScript)}
            onChange={(e) => setEditContent({ ...editContent, [latestScript.id]: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
