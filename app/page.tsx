import { SeriesList } from '@/components/series/series-list';

export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">시리즈</h1>
        <p className="text-muted-foreground text-sm mt-1">쇼츠 영상 시리즈를 관리하세요</p>
      </div>
      <SeriesList />
    </div>
  );
}
