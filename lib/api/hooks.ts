import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from './axios-instance';
import {
  seriesControllerFindAll,
  seriesControllerFindOne,
  seriesControllerCreate,
  seriesControllerUpdate,
  seriesControllerRemove,
} from './generated/series/series';
import {
  episodesControllerFindBySeries,
  episodesControllerFindOne,
  episodesControllerCreate,
  episodesControllerUpdate,
  episodesControllerRemove,
} from './generated/episodes/episodes';
import {
  scriptsControllerFindByEpisode,
  scriptsControllerGenerateScript,
  scriptsControllerUpdate,
  scriptsControllerGenerateScenes,
} from './generated/scripts/scripts';
import {
  scenesControllerFindByEpisode,
  scenesControllerFindOne,
  scenesControllerFindImages,
  scenesControllerFindVoices,
  scenesControllerFindAnimatedClips,
  scenesControllerGenerateImage,
  scenesControllerGenerateTts,
  scenesControllerGenerateImageToVideo,
  scenesControllerRenderClip,
  scenesControllerSelectImage,
  scenesControllerUpdate,
} from './generated/scenes/scenes';
import {
  videosControllerFindByEpisode,
  videosControllerRenderFinal,
} from './generated/videos/videos';
import {
  jobsControllerFindAll,
  jobsControllerGetQueueStats,
} from './generated/jobs/jobs';
import {
  charactersControllerFindBySeries,
  charactersControllerCreate,
  charactersControllerUpdate,
  charactersControllerRemove,
  charactersControllerFindReferences,
  charactersControllerAddReference,
  charactersControllerRemoveReference,
  charactersControllerGenerateImages,
} from './generated/characters/characters';

// ── Query Keys ────────────────────────────────────────────────
export const QK = {
  series: () => ['series'],
  seriesOne: (id: string) => ['series', id],
  episodes: (seriesId: string) => ['episodes', seriesId],
  episodeOne: (id: string) => ['episode', id],
  scripts: (episodeId: string) => ['scripts', episodeId],
  scenes: (episodeId: string) => ['scenes', episodeId],
  sceneImages: (sceneId: string) => ['scene-images', sceneId],
  sceneVoices: (sceneId: string) => ['scene-voices', sceneId],
  sceneClips: (sceneId: string) => ['scene-clips', sceneId],
  videos: (episodeId: string) => ['videos', episodeId],
  jobs: () => ['jobs'],
  queueStats: () => ['queue-stats'],
  characters: (seriesId: string) => ['characters', seriesId],
  characterRefs: (characterId: string) => ['character-refs', characterId],
};

// ── Series ────────────────────────────────────────────────────
export const useSeriesList = () =>
  useQuery({ queryKey: QK.series(), queryFn: ({ signal }) => seriesControllerFindAll(signal) });

export const useSeriesOne = (id: string) =>
  useQuery({ queryKey: QK.seriesOne(id), queryFn: ({ signal }) => seriesControllerFindOne(id, signal), enabled: !!id });

export const useCreateSeries = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Parameters<typeof seriesControllerCreate>[0]) => seriesControllerCreate(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.series() }),
  });
};

export const useUpdateSeries = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Parameters<typeof seriesControllerUpdate>[1]) => seriesControllerUpdate(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.series() });
      qc.invalidateQueries({ queryKey: QK.seriesOne(id) });
    },
  });
};

export const useDeleteSeries = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => seriesControllerRemove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.series() }),
  });
};

// ── Episodes ──────────────────────────────────────────────────
export const useEpisodeList = (seriesId: string) =>
  useQuery({ queryKey: QK.episodes(seriesId), queryFn: ({ signal }) => episodesControllerFindBySeries(seriesId, signal), enabled: !!seriesId });

export const useEpisodeOne = (id: string) =>
  useQuery({ queryKey: QK.episodeOne(id), queryFn: ({ signal }) => episodesControllerFindOne(id, signal), enabled: !!id });

export const useCreateEpisode = (seriesId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Parameters<typeof episodesControllerCreate>[1]) => episodesControllerCreate(seriesId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.episodes(seriesId) }),
  });
};

export const useUpdateEpisode = (episodeId: string, seriesId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Parameters<typeof episodesControllerUpdate>[1]) => episodesControllerUpdate(episodeId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.episodeOne(episodeId) });
      qc.invalidateQueries({ queryKey: QK.episodes(seriesId) });
    },
  });
};

export const useDeleteEpisode = (seriesId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => episodesControllerRemove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.episodes(seriesId) }),
  });
};

// ── Scripts ───────────────────────────────────────────────────
export const useScripts = (episodeId: string) =>
  useQuery({ queryKey: QK.scripts(episodeId), queryFn: ({ signal }) => scriptsControllerFindByEpisode(episodeId, signal), enabled: !!episodeId });

export const useGenerateScript = (episodeId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Parameters<typeof scriptsControllerGenerateScript>[1]) => scriptsControllerGenerateScript(episodeId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.scripts(episodeId) }),
  });
};

export const useUpdateScript = (episodeId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof scriptsControllerUpdate>[1] }) =>
      scriptsControllerUpdate(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.scripts(episodeId) }),
  });
};

export const useGenerateScenes = (episodeId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scriptId: string) => scriptsControllerGenerateScenes(scriptId),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.scenes(episodeId) }),
  });
};

// ── Scenes ────────────────────────────────────────────────────
export const useSceneList = (episodeId: string) =>
  useQuery({ queryKey: QK.scenes(episodeId), queryFn: ({ signal }) => scenesControllerFindByEpisode(episodeId, signal), enabled: !!episodeId });

export const useUpdateScene = (episodeId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof scenesControllerUpdate>[1] }) =>
      scenesControllerUpdate(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.scenes(episodeId) }),
  });
};

export const useSceneImages = (sceneId: string) =>
  useQuery({ queryKey: QK.sceneImages(sceneId), queryFn: ({ signal }) => scenesControllerFindImages(sceneId, signal), enabled: !!sceneId, refetchInterval: 5000 });

export const useSceneVoices = (sceneId: string) =>
  useQuery({ queryKey: QK.sceneVoices(sceneId), queryFn: ({ signal }) => scenesControllerFindVoices(sceneId, signal), enabled: !!sceneId, refetchInterval: 5000 });

export const useSceneClips = (sceneId: string) =>
  useQuery({ queryKey: QK.sceneClips(sceneId), queryFn: ({ signal }) => scenesControllerFindAnimatedClips(sceneId, signal), enabled: !!sceneId, refetchInterval: 5000 });

export const useSceneVideoClips = (sceneId: string) =>
  useQuery({ queryKey: ['scene-video-clips', sceneId], queryFn: ({ signal }) => axiosInstance<void>({ url: `/api/v1/scenes/${sceneId}/clips`, method: 'GET', signal }), enabled: !!sceneId, refetchInterval: 5000 });

export const useGenerateSceneImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sceneId, dto }: { sceneId: string; dto: Parameters<typeof scenesControllerGenerateImage>[1] }) =>
      scenesControllerGenerateImage(sceneId, dto),
    onSuccess: (_, { sceneId }) => qc.invalidateQueries({ queryKey: QK.sceneImages(sceneId) }),
  });
};

export const useGenerateTts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sceneId, dto }: { sceneId: string; dto: Parameters<typeof scenesControllerGenerateTts>[1] }) =>
      scenesControllerGenerateTts(sceneId, dto),
    onSuccess: (_, { sceneId }) => qc.invalidateQueries({ queryKey: QK.sceneVoices(sceneId) }),
  });
};

export const useGenerateAnimation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sceneId, dto }: { sceneId: string; dto: Parameters<typeof scenesControllerGenerateImageToVideo>[1] }) =>
      scenesControllerGenerateImageToVideo(sceneId, dto),
    onSuccess: (_, { sceneId }) => qc.invalidateQueries({ queryKey: QK.sceneClips(sceneId) }),
  });
};

export const useRenderClip = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sceneId, dto }: { sceneId: string; dto: Parameters<typeof scenesControllerRenderClip>[1] }) =>
      scenesControllerRenderClip(sceneId, dto),
  });
};

export const useCreateScene = (episodeId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown> = {}) =>
      axiosInstance({ url: `/api/v1/episodes/${episodeId}/scenes`, method: 'POST', data: dto }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.scenes(episodeId) }),
  });
};

export const useDeleteScene = (episodeId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sceneId: string) =>
      axiosInstance({ url: `/api/v1/scenes/${sceneId}`, method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.scenes(episodeId) }),
  });
};

export const useReorderScenes = (episodeId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sceneIds: string[]) =>
      axiosInstance({ url: `/api/v1/episodes/${episodeId}/scenes/reorder`, method: 'PATCH', data: { sceneIds } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.scenes(episodeId) }),
  });
};

export const useSelectImage = (sceneId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => scenesControllerSelectImage(sceneId, imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.sceneImages(sceneId) }),
  });
};

// ── Videos ────────────────────────────────────────────────────
export const useVideos = (episodeId: string) =>
  useQuery({
    queryKey: QK.videos(episodeId),
    queryFn: ({ signal }) => videosControllerFindByEpisode(episodeId, signal),
    enabled: !!episodeId,
    refetchInterval: (query) => {
      const videos = (query.state.data as unknown) as any[] | undefined;
      if (!videos?.length) return 3000;
      const hasActive = videos.some(v => v.status === 'PENDING' || v.status === 'PROCESSING' || v.status === 'RENDERING');
      return hasActive ? 3000 : false;
    },
  });

export const useRenderFinal = (episodeId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => videosControllerRenderFinal(episodeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.videos(episodeId) }),
  });
};

// ── Jobs ──────────────────────────────────────────────────────
export const useJobs = () =>
  useQuery({ queryKey: QK.jobs(), queryFn: ({ signal }) => jobsControllerFindAll(undefined, signal), refetchInterval: 5000 });

export const useQueueStats = () =>
  useQuery({ queryKey: QK.queueStats(), queryFn: ({ signal }) => jobsControllerGetQueueStats(signal), refetchInterval: 5000 });

// ── Scene Job Progress ────────────────────────────────────────
export const useSceneProgress = (sceneId: string) => {
  const { data: jobsData } = useJobs();
  const jobs = ((jobsData as any)?.data ?? []) as any[];
  const latest = (type: string) =>
    jobs
      .filter((j) => j.targetId === sceneId && j.type === type)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
  return {
    imageJob: latest('SCENE_IMAGE'),
    ttsJob: latest('TTS'),
    animJob: latest('IMAGE_TO_VIDEO'),
    renderJob: latest('VIDEO_RENDER'),
  };
};

// ── Characters ────────────────────────────────────────────────
export const useCharacters = (seriesId: string) =>
  useQuery({ queryKey: QK.characters(seriesId), queryFn: ({ signal }) => charactersControllerFindBySeries(seriesId, signal), enabled: !!seriesId });

export const useCharacterRefs = (characterId: string) =>
  useQuery({ queryKey: QK.characterRefs(characterId), queryFn: ({ signal }) => charactersControllerFindReferences(characterId, signal), enabled: !!characterId });

export const useCreateCharacter = (seriesId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Parameters<typeof charactersControllerCreate>[1]) => charactersControllerCreate(seriesId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.characters(seriesId) }),
  });
};

export const useUpdateCharacter = (seriesId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof charactersControllerUpdate>[1] }) =>
      charactersControllerUpdate(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.characters(seriesId) }),
  });
};

export const useDeleteCharacter = (seriesId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => charactersControllerRemove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.characters(seriesId) }),
  });
};

export const useAddCharacterRef = (characterId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Parameters<typeof charactersControllerAddReference>[1]) =>
      charactersControllerAddReference(characterId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.characterRefs(characterId) }),
  });
};

export const useDeleteCharacterRef = (characterId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (referenceId: string) => charactersControllerRemoveReference(characterId, referenceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.characterRefs(characterId) }),
  });
};

export const useGenerateCharacterImages = (seriesId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (characterId: string) => charactersControllerGenerateImages(characterId),
    onSuccess: (_data, characterId) => {
      qc.invalidateQueries({ queryKey: QK.characterRefs(characterId) });
      qc.invalidateQueries({ queryKey: QK.characters(seriesId) });
    },
  });
};
