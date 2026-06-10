'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, Pencil, ChevronDown, ChevronUp, Save, ImageIcon, Mic, Video, Film } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useSceneImages, useSceneVoices, useSceneClips, useSceneVideoClips,
  useSelectImage, useUpdateScene, useSceneProgress,
} from '@/lib/api/hooks';
import type { Scene, SceneImage, SceneVoice, SceneAnimatedClip, VideoClip } from '@/lib/api/types';

interface Props {
  scene: Scene; episodeId: string; apiUrl: string;
  editOpen?: boolean; onEditClose?: () => void;
  busyImage: boolean; busyTts: boolean; busyAnimate: boolean; busyRender: boolean;
  onGenerateImage: (opts?: { prompt?: string }) => void;
  onGenerateTts: () => void;
  onAnimate: (opts?: { motionPrompt?: string; duration?: 5 | 10 }) => void;
  onRender: () => void;
}

const MOTION_EFFECTS = ['none','zoom_in','zoom_out','pan_right','pan_left','ken_burns','shake','flash','impact_zoom','speed_pan','strobe'];

export function ScenePipeline({
  scene, episodeId, apiUrl,
  editOpen: editOpenProp, onEditClose,
  busyImage, busyTts, busyAnimate, busyRender,
  onGenerateImage, onGenerateTts, onAnimate, onRender,
}: Props) {
  const [editOpenLocal, setEditOpenLocal] = useState(false);
  const editOpen = editOpenProp ?? editOpenLocal;
  const setEditOpen = (v: boolean) => { setEditOpenLocal(v); if (!v) onEditClose?.(); };

  const [draft, setDraft] = useState<{
    background: string; emotion: string; cameraDirection: string;
    motionEffect: string; motionPrompt: string; dialogueJson: string;
  }>({
    background: scene.background ?? '',
    emotion: scene.emotion ?? '',
    cameraDirection: scene.cameraDirection ?? '',
    motionEffect: scene.motionEffect ?? '',
    motionPrompt: scene.motionPrompt ?? '',
    dialogueJson: scene.dialogueJson ?? '',
  });

  const [imagePrompt, setImagePrompt] = useState('');
  const [imageOptsOpen, setImageOptsOpen] = useState(false);
  const [animMotionPrompt, setAnimMotionPrompt] = useState(scene.motionPrompt ?? '');
  const [animDuration, setAnimDuration] = useState<5 | 10>(5);
  const [animOptsOpen, setAnimOptsOpen] = useState(false);

  const { data: imagesData }     = useSceneImages(scene.id);
  const { data: voicesData }     = useSceneVoices(scene.id);
  const { data: clipsData }      = useSceneClips(scene.id);
  const { data: videoClipsData } = useSceneVideoClips(scene.id);
  const selectImage  = useSelectImage(scene.id);
  const updateScene  = useUpdateScene(episodeId);
  const { imageJob, ttsJob, animJob, renderJob } = useSceneProgress(scene.id);

  const images     = (imagesData     as unknown as SceneImage[])        ?? [];
  const voices     = (voicesData     as unknown as SceneVoice[])        ?? [];
  const clips      = (clipsData      as unknown as SceneAnimatedClip[]) ?? [];
  const videoClips = (videoClipsData as unknown as VideoClip[])         ?? [];

  const selectedImage = images.find(i => i.isSelected) ?? images[0];
  const selectedVoice = voices.find(v => v.isSelected) ?? voices[0];
  const selectedClip  = clips.find(c => c.isSelected)  ?? clips[0];

  const dialogue = scene.dialogueJson
    ? (() => { try { return JSON.parse(scene.dialogueJson); } catch { return []; } })()
    : [];

  const resolveUrl = (url: string | null | undefined) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${apiUrl}${url}`;
  };

  const handleSave = async () => {
    try {
      await updateScene.mutateAsync({ id: scene.id, dto: draft as any });
      toast.success('저장됐어요');
      setEditOpen(false);
    } catch { toast.error('저장 실패'); }
  };

  return (
    <div className="space-y-5">

      {/* 씬 정보 / 편집 */}
      <div>
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          onClick={() => setEditOpen(!editOpen)}
        >
          <Pencil className="h-3 w-3" />
          씬 정보 {editOpen ? '접기' : '편집'}
        </button>

        {!editOpen ? (
          <div className="grid grid-cols-1 gap-1 text-sm">
            {scene.background && (
              <div className="flex gap-2">
                <span className="text-muted-foreground shrink-0 w-14">배경</span>
                <span className="text-foreground/80">{scene.background}</span>
              </div>
            )}
            {scene.emotion && (
              <div className="flex gap-2">
                <span className="text-muted-foreground shrink-0 w-14">감정</span>
                <span className="text-foreground/80">{scene.emotion}</span>
              </div>
            )}
            {scene.cameraDirection && (
              <div className="flex gap-2">
                <span className="text-muted-foreground shrink-0 w-14">카메라</span>
                <span className="text-foreground/80">{scene.cameraDirection}</span>
              </div>
            )}
            {scene.motionEffect && scene.motionEffect !== 'none' && (
              <div className="flex gap-2">
                <span className="text-muted-foreground shrink-0 w-14">효과</span>
                <span className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">{scene.motionEffect}</span>
              </div>
            )}
            {dialogue.length > 0 && (
              <div className="mt-1 space-y-1">
                {dialogue.map((d: any, i: number) => (
                  <div key={i} className="flex gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
                    <span className="font-semibold shrink-0 text-foreground/70">{d.character}</span>
                    <span className="text-muted-foreground">{d.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 p-4 bg-background rounded-xl border">
            <div className="space-y-1.5">
              <Label className="text-xs">배경</Label>
              <Textarea className="text-xs min-h-[56px] resize-none" value={draft.background}
                onChange={(e) => setDraft({ ...draft, background: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">감정</Label>
                <Input className="text-xs h-8" value={draft.emotion}
                  onChange={(e) => setDraft({ ...draft, emotion: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">카메라</Label>
                <Input className="text-xs h-8" value={draft.cameraDirection}
                  onChange={(e) => setDraft({ ...draft, cameraDirection: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">모션 효과</Label>
                <Select value={draft.motionEffect || 'none'} onValueChange={(v) => setDraft({ ...draft, motionEffect: v || 'none' })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MOTION_EFFECTS.map(v => <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">모션 프롬프트 (Kling)</Label>
              <Textarea className="text-xs min-h-[56px] resize-none" value={draft.motionPrompt}
                onChange={(e) => setDraft({ ...draft, motionPrompt: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">대사 JSON</Label>
              <Textarea className="text-xs min-h-[56px] resize-none font-mono" value={draft.dialogueJson}
                onChange={(e) => setDraft({ ...draft, dialogueJson: e.target.value })} />
            </div>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSave} disabled={updateScene.isPending}>
              <Save className="h-3.5 w-3.5" />
              {updateScene.isPending ? '저장 중...' : '저장'}
            </Button>
          </div>
        )}
      </div>

      {/* 파이프라인 4단계 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* STEP 1: 이미지 */}
        <StepCard
          icon={ImageIcon} number={1} label="씬 이미지"
          done={images.length > 0} busy={busyImage} job={imageJob}
          actionLabel={images.length > 0 ? '재생성' : '이미지 생성'}
          onAction={() => onGenerateImage({ prompt: imagePrompt || undefined })}
          optsOpen={imageOptsOpen} onToggleOpts={() => setImageOptsOpen(!imageOptsOpen)}
          opts={
            <div className="space-y-1.5">
              <Label className="text-xs">추가 프롬프트</Label>
              <Input className="text-xs h-7" placeholder="더 밝게, 다른 앵글..." value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)} />
            </div>
          }
        >
          {selectedImage && (() => {
            const url = resolveUrl(selectedImage.imageUrl);
            return url ? (
              <div className="mt-3 relative w-full aspect-[9/16] max-w-[140px] rounded-lg overflow-hidden border">
                <Image src={url} alt="씬이미지" fill className="object-cover" unoptimized />
              </div>
            ) : null;
          })()}
        </StepCard>

        {/* STEP 2: TTS */}
        <StepCard
          icon={Mic} number={2} label="TTS 음성"
          done={voices.length > 0} busy={busyTts} job={ttsJob}
          actionLabel={voices.length > 0 ? '재생성' : 'TTS 생성'}
          onAction={onGenerateTts}
        >
          {selectedVoice?.audioUrl && (
            <div className="mt-3 space-y-1">
              <audio controls src={resolveUrl(selectedVoice.audioUrl) ?? ''} className="w-full h-8" />
              {selectedVoice.duration && (
                <p className="text-xs text-muted-foreground">{Number(selectedVoice.duration).toFixed(1)}초</p>
              )}
            </div>
          )}
        </StepCard>

        {/* STEP 3: 애니메이션 */}
        <StepCard
          icon={Video} number={3} label="AI 애니메이션"
          done={clips.length > 0} busy={busyAnimate} job={animJob}
          actionLabel={clips.length > 0 ? '재생성' : '애니메이션 생성'}
          onAction={() => onAnimate({ motionPrompt: animMotionPrompt || undefined, duration: animDuration })}
          disabled={!selectedImage}
          optsOpen={animOptsOpen} onToggleOpts={() => setAnimOptsOpen(!animOptsOpen)}
          opts={
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs">모션 프롬프트 오버라이드</Label>
                <Textarea className="text-xs min-h-[50px] resize-none" placeholder="비워두면 씬 기본값 사용"
                  value={animMotionPrompt} onChange={(e) => setAnimMotionPrompt(e.target.value)} />
              </div>
              <div className="flex gap-2">
                {([5, 10] as const).map(d => (
                  <button key={d} onClick={() => setAnimDuration(d)}
                    className={`flex-1 py-1 text-xs rounded-md border transition-colors ${animDuration === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                  >{d}초</button>
                ))}
              </div>
            </div>
          }
        >
          {selectedClip?.videoUrl && (() => {
            const url = resolveUrl(selectedClip.videoUrl);
            return url ? (
              <div className="mt-3">
                <video src={url} controls className="w-full max-w-[140px] rounded-lg border" />
              </div>
            ) : null;
          })()}
        </StepCard>

        {/* STEP 4: 클립 렌더링 */}
        <StepCard
          icon={Film} number={4} label="씬 클립 렌더링"
          done={videoClips.length > 0} busy={busyRender} job={renderJob}
          actionLabel={videoClips.length > 0 ? '재렌더링' : '렌더링'}
          onAction={onRender}
          disabled={!selectedImage || !selectedVoice}
        >
          {videoClips[0] && (() => {
            const url = resolveUrl(videoClips[0].videoUrl);
            return url ? (
              <div className="mt-3 space-y-1">
                <video src={url} controls className="w-full max-w-[140px] rounded-lg border" />
                {videoClips[0].duration && (
                  <p className="text-xs text-muted-foreground">{Number(videoClips[0].duration).toFixed(1)}초</p>
                )}
              </div>
            ) : null;
          })()}
        </StepCard>

      </div>
    </div>
  );
}

function StepCard({
  icon: Icon, number, label, done, busy, job,
  actionLabel, onAction, disabled, children,
  optsOpen, onToggleOpts, opts,
}: {
  icon: React.ElementType; number: number; label: string;
  done: boolean; busy: boolean; job?: any;
  actionLabel: string; onAction: () => void; disabled?: boolean;
  children?: React.ReactNode;
  optsOpen?: boolean; onToggleOpts?: () => void; opts?: React.ReactNode;
}) {
  const isRunning = job && ['PENDING', 'ACTIVE'].includes(job.status);
  const isFailed  = job?.status === 'FAILED';

  return (
    <div className={`rounded-xl border p-4 bg-background transition-colors ${done ? 'border-green-200/70' : 'border-border'}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${done ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground">STEP {number}</span>
              {done && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
            </div>
            <p className="text-sm font-medium leading-tight">{label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {opts && onToggleOpts && (
            <button onClick={onToggleOpts} className="p-1 text-muted-foreground hover:text-foreground">
              {optsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
          <Button size="sm" variant={done ? 'outline' : 'default'} className="h-7 text-xs px-2.5"
            onClick={onAction} disabled={busy || disabled || isRunning}>
            {busy || isRunning ? '처리중...' : actionLabel}
          </Button>
        </div>
      </div>

      {/* 진행 바 */}
      {isRunning && (
        <div className="mb-2 space-y-0.5">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${job.progress || 5}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground">{job.progress || 0}% 처리 중</p>
        </div>
      )}
      {isFailed && <p className="mb-2 text-xs text-destructive">{job.error ?? '생성 실패'}</p>}

      {/* 옵션 */}
      {opts && optsOpen && (
        <div className="mb-3 p-3 bg-muted/30 rounded-lg border text-xs">{opts}</div>
      )}

      {/* 미디어 */}
      {children}
    </div>
  );
}
