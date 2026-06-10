import { EpisodeWorkspace } from '@/components/episodes/episode-workspace';

interface Props {
  params: Promise<{ seriesId: string; episodeId: string }>;
}

export default async function EpisodePage({ params }: Props) {
  const { seriesId, episodeId } = await params;
  return <EpisodeWorkspace seriesId={seriesId} episodeId={episodeId} />;
}
