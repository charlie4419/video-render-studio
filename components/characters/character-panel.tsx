'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Sparkles, X, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  useCharacters, useCharacterRefs,
  useCreateCharacter, useUpdateCharacter, useDeleteCharacter,
  useAddCharacterRef, useDeleteCharacterRef, useGenerateCharacterImages,
} from '@/lib/api/hooks';

interface Props { seriesId: string }

type CharacterDraft = {
  name: string; description: string; age: string; gender: string;
  personality: string; basePrompt: string;
  voiceType: string; elevenLabsVoiceType: string; typecastVoiceType: string;
};

const emptyDraft = (): CharacterDraft => ({
  name: '', description: '', age: '', gender: '',
  personality: '', basePrompt: '',
  voiceType: '', elevenLabsVoiceType: '', typecastVoiceType: '',
});

const REF_TYPES = ['FRONT', 'LEFT', 'RIGHT', 'BACK', 'FULL', 'CUSTOM'];

export function CharacterPanel({ seriesId }: Props) {
  const { data: charsData, isLoading } = useCharacters(seriesId);
  const characters = (charsData as any)?.data ?? (Array.isArray(charsData) ? charsData : []) as any[];

  const createChar = useCreateCharacter(seriesId);
  const updateChar = useUpdateCharacter(seriesId);
  const deleteChar = useDeleteCharacter(seriesId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CharacterDraft>(emptyDraft());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreate = () => { setDraft(emptyDraft()); setCreateOpen(true); };
  const openEdit = (char: any) => {
    setDraft({
      name: char.name ?? '', description: char.description ?? '',
      age: char.age != null ? String(char.age) : '', gender: char.gender ?? '',
      personality: char.personality ?? '', basePrompt: char.basePrompt ?? '',
      voiceType: char.voiceType ?? '', elevenLabsVoiceType: char.elevenLabsVoiceType ?? '',
      typecastVoiceType: char.typecastVoiceType ?? '',
    });
    setEditingId(char.id);
  };

  const handleCreate = async () => {
    if (!draft.name.trim()) { toast.error('이름을 입력해주세요'); return; }
    try {
      await createChar.mutateAsync({
        name: draft.name.trim(),
        description: draft.description || undefined,
        age: draft.age ? Number(draft.age) : undefined,
        gender: draft.gender || undefined,
        personality: draft.personality || undefined,
        basePrompt: draft.basePrompt || undefined,
        voiceType: draft.voiceType || undefined,
        elevenLabsVoiceType: draft.elevenLabsVoiceType || undefined,
        typecastVoiceType: draft.typecastVoiceType || undefined,
      });
      toast.success('캐릭터 생성됐어요');
      setCreateOpen(false);
    } catch { toast.error('캐릭터 생성 실패'); }
  };

  const handleUpdate = async () => {
    if (!editingId || !draft.name.trim()) return;
    try {
      await updateChar.mutateAsync({
        id: editingId,
        dto: {
          name: draft.name.trim(),
          description: draft.description || undefined,
          age: draft.age ? Number(draft.age) : undefined,
          gender: draft.gender || undefined,
          personality: draft.personality || undefined,
          basePrompt: draft.basePrompt || undefined,
          voiceType: draft.voiceType || undefined,
          elevenLabsVoiceType: draft.elevenLabsVoiceType || undefined,
          typecastVoiceType: draft.typecastVoiceType || undefined,
        },
      });
      toast.success('저장됐어요');
      setEditingId(null);
    } catch { toast.error('저장 실패'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChar.mutateAsync(id);
      toast.success('삭제됐어요');
      setConfirmDeleteId(null);
      if (expandedId === id) setExpandedId(null);
    } catch { toast.error('삭제 실패'); }
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{characters.length}명의 캐릭터</p>
        <Button size="sm" className="gap-1 h-8" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> 캐릭터 추가
        </Button>
      </div>

      {characters.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg">
          캐릭터가 없어요. 추가해보세요!
        </div>
      )}

      {characters.map((char: any) => (
        <CharacterCard
          key={char.id}
          char={char}
          seriesId={seriesId}
          expanded={expandedId === char.id}
          onToggle={() => setExpandedId(expandedId === char.id ? null : char.id)}
          onEdit={() => openEdit(char)}
          onDelete={() => setConfirmDeleteId(char.id)}
          editingId={editingId}
          draft={draft}
          setDraft={setDraft}
          onSave={handleUpdate}
          onCancelEdit={() => setEditingId(null)}
          isSaving={updateChar.isPending}
        />
      ))}

      {/* 생성 다이얼로그 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>새 캐릭터 추가</DialogTitle></DialogHeader>
          <CharacterForm draft={draft} setDraft={setDraft} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>취소</Button>
            <Button onClick={handleCreate} disabled={createChar.isPending}>
              {createChar.isPending ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>캐릭터 삭제</DialogTitle></DialogHeader>
          <p className="text-sm">정말 삭제할까요? 레퍼런스 이미지도 모두 삭제됩니다.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>취소</Button>
            <Button variant="destructive" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              disabled={deleteChar.isPending}>
              {deleteChar.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CharacterCard({
  char, seriesId, expanded, onToggle, onEdit, onDelete,
  editingId, draft, setDraft, onSave, onCancelEdit, isSaving,
}: {
  char: any; seriesId: string; expanded: boolean;
  onToggle: () => void; onEdit: () => void; onDelete: () => void;
  editingId: string | null; draft: CharacterDraft; setDraft: (d: CharacterDraft) => void;
  onSave: () => void; onCancelEdit: () => void; isSaving: boolean;
}) {
  const isEditing = editingId === char.id;
  const { data: refsData } = useCharacterRefs(expanded ? char.id : '');
  const refs = (refsData as any)?.data ?? (Array.isArray(refsData) ? refsData : []) as any[];
  const generateImages = useGenerateCharacterImages(seriesId);
  const addRef = useAddCharacterRef(char.id);
  const deleteRef = useDeleteCharacterRef(char.id);

  const [refUrl, setRefUrl] = useState('');
  const [refType, setRefType] = useState('FRONT');
  const [refPrompt, setRefPrompt] = useState('');
  const [addRefOpen, setAddRefOpen] = useState(false);

  const handleAddRef = async () => {
    if (!refUrl.trim()) { toast.error('URL을 입력해주세요'); return; }
    try {
      await addRef.mutateAsync({ imageUrl: refUrl.trim(), type: refType, prompt: refPrompt || undefined });
      toast.success('레퍼런스 추가됐어요');
      setRefUrl(''); setRefPrompt(''); setAddRefOpen(false);
    } catch { toast.error('추가 실패'); }
  };

  const handleDeleteRef = async (refId: string) => {
    try {
      await deleteRef.mutateAsync(refId);
      toast.success('삭제됐어요');
    } catch { toast.error('삭제 실패'); }
  };

  const handleGenerate = async () => {
    try {
      await generateImages.mutateAsync(char.id);
      toast.success('이미지 생성 요청됐어요');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? '생성 실패');
    }
  };

  const thumbnailRef = refs.find((r: any) => r.type === 'FRONT') ?? refs[0];

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-3 p-3 bg-card hover:bg-muted/20 transition-colors">
        {/* 썸네일 */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
          {thumbnailRef?.imageUrl ? (
            <Image src={thumbnailRef.imageUrl} alt={char.name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-bold">
              {char.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{char.name}</span>
            {char.gender && <Badge variant="outline" className="text-xs">{char.gender}</Badge>}
            {char.age && <span className="text-xs text-muted-foreground">{char.age}세</span>}
          </div>
          {char.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{char.description}</p>}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button size="icon" variant="ghost" className="h-7 w-7" title="편집" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" title="삭제" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <button onClick={onToggle} className="p-1 text-muted-foreground">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 편집 폼 */}
      {isEditing && (
        <div className="p-3 border-t bg-muted/10 space-y-3">
          <CharacterForm draft={draft} setDraft={setDraft} />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs gap-1" onClick={onSave} disabled={isSaving}>
              <Save className="h-3.5 w-3.5" /> {isSaving ? '저장 중...' : '저장'}
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onCancelEdit}>취소</Button>
          </div>
        </div>
      )}

      {/* 확장 영역: 레퍼런스 이미지 */}
      {expanded && (
        <div className="p-3 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">레퍼런스 이미지 ({refs.length})</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleGenerate}
                disabled={generateImages.isPending}>
                <Sparkles className="h-3.5 w-3.5" />
                {generateImages.isPending ? '생성 중...' : 'AI 이미지 생성'}
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setAddRefOpen(!addRefOpen)}>
                <Plus className="h-3.5 w-3.5" /> URL 추가
              </Button>
            </div>
          </div>

          {addRefOpen && (
            <div className="p-3 bg-muted/20 rounded-lg border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">이미지 URL</Label>
                  <Input className="text-xs h-7" placeholder="https://..." value={refUrl} onChange={(e) => setRefUrl(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">타입</Label>
                  <select
                    className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
                    value={refType}
                    onChange={(e) => setRefType(e.target.value)}
                  >
                    {REF_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">프롬프트 (선택)</Label>
                <Input className="text-xs h-7" placeholder="이미지 설명..." value={refPrompt} onChange={(e) => setRefPrompt(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs" onClick={handleAddRef} disabled={addRef.isPending}>
                  {addRef.isPending ? '추가 중...' : '추가'}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAddRefOpen(false)}>취소</Button>
              </div>
            </div>
          )}

          {refs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">레퍼런스 이미지가 없어요</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {refs.map((ref: any) => (
                <div key={ref.id} className="relative group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted">
                    <Image src={ref.imageUrl} alt={ref.type} width={80} height={80} className="object-cover w-full h-full" unoptimized />
                  </div>
                  <Badge variant="secondary" className="absolute bottom-1 left-1 text-[10px] px-1 py-0">{ref.type}</Badge>
                  <button
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteRef(ref.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CharacterForm({ draft, setDraft }: { draft: CharacterDraft; setDraft: (d: CharacterDraft) => void }) {
  const set = (k: keyof CharacterDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft({ ...draft, [k]: e.target.value });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 col-span-2">
          <Label className="text-xs">이름 *</Label>
          <Input className="text-xs h-8" value={draft.name} onChange={set('name')} placeholder="캐릭터 이름" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">나이</Label>
          <Input className="text-xs h-8" type="number" value={draft.age} onChange={set('age')} placeholder="예: 15" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">성별</Label>
          <Input className="text-xs h-8" value={draft.gender} onChange={set('gender')} placeholder="예: 남, 여" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">설명</Label>
        <Textarea className="text-xs min-h-[50px] resize-none" value={draft.description} onChange={set('description')} placeholder="캐릭터 설명" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">역할 및 말투 <span className="text-muted-foreground font-normal">(스토리 생성에 사용)</span></Label>
        <Textarea className="text-xs min-h-[70px] resize-none" value={draft.personality} onChange={set('personality')}
          placeholder="예: 시공 하자를 꼼꼼히 발견하는 탐정. 단호하고 논리적인 말투로 증거 중심 설명." />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">이미지 기본 프롬프트</Label>
        <Textarea className="text-xs min-h-[60px] resize-none" value={draft.basePrompt} onChange={set('basePrompt')} placeholder="AI 이미지 생성에 사용될 기본 프롬프트" />
      </div>
      <div className="space-y-2 pt-1 border-t">
        <p className="text-xs font-medium text-muted-foreground">음성 설정</p>
        <div className="grid grid-cols-1 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Typecast Voice ID</Label>
            <Input className="text-xs h-8" value={draft.typecastVoiceType} onChange={set('typecastVoiceType')} placeholder="Typecast actor_id" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">ElevenLabs Voice</Label>
            <Input className="text-xs h-8" value={draft.elevenLabsVoiceType} onChange={set('elevenLabsVoiceType')} placeholder="adam, rachel, ..." />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">OpenAI Voice</Label>
            <Input className="text-xs h-8" value={draft.voiceType} onChange={set('voiceType')} placeholder="alloy, nova, ..." />
          </div>
        </div>
      </div>
    </div>
  );
}
