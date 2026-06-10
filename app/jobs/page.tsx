import { JobsPanel } from '@/components/jobs/jobs-panel';

export default function JobsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">작업 현황</h1>
        <p className="text-muted-foreground text-sm mt-1">AI 생성 작업 상태를 모니터링하세요</p>
      </div>
      <JobsPanel />
    </div>
  );
}
