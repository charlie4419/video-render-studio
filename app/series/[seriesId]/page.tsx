import { EpisodeList } from '@/components/episodes/episode-list';

interface Props {
  params: Promise<{ seriesId: string }>;
}

export default async function SeriesPage({ params }: Props) {
  const { seriesId } = await params;
  return <EpisodeList seriesId={seriesId} />;
}
