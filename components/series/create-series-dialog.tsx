'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateSeries } from '@/lib/api/hooks';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSeriesDialog({ open, onOpenChange }: Props) {
  const createMutation = useCreateSeries();
  const [form, setForm] = useState({ title: '', description: '', stylePrompt: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await createMutation.mutateAsync({ title: form.title, description: form.description, stylePrompt: form.stylePrompt });
      toast.success('시리즈 생성됐어요');
      setForm({ title: '', description: '', stylePrompt: '' });
      onOpenChange(false);
    } catch {
      toast.error('생성 실패');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 시리즈 만들기</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">제목 *</Label>
            <Input id="title" placeholder="예: 에반맨의 모험" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">설명</Label>
            <Textarea id="description" placeholder="시리즈 소개" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stylePrompt">스타일 프롬프트</Label>
            <Input id="stylePrompt" placeholder="예: anime style, vibrant colors" value={form.stylePrompt} onChange={(e) => setForm({ ...form, stylePrompt: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>취소</Button>
            <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? '생성 중...' : '만들기'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
