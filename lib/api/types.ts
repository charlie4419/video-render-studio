// ── Enums ──────────────────────────────────────────────────
export type EpisodeStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'PUBLISHED';
export type SceneStatus = 'PENDING' | 'IMAGE_READY' | 'TTS_READY' | 'VIDEO_READY' | 'DONE';
export type JobType = 'SCENE_IMAGE' | 'TTS' | 'IMAGE_TO_VIDEO' | 'VIDEO_RENDER' | 'FINAL_RENDER' | 'CHARACTER_IMAGE';
export type JobStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type FinalVideoStatus = 'PENDING' | 'RENDERING' | 'COMPLETED' | 'FAILED';

// ── Entities ───────────────────────────────────────────────
export interface Series {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  stylePrompt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  episodes?: Episode[];
  characters?: Character[];
}

export interface Episode {
  id: string;
  seriesId: string;
  episodeNumber: number;
  title: string;
  description: string | null;
  status: EpisodeStatus;
  thumbnail: string | null;
  finalVideoId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Script {
  id: string;
  episodeId: string;
  version: number;
  content: string | null;
  prompt: string | null;
  summary: string | null;
  status: 'DRAFT' | 'GENERATING' | 'READY' | 'APPROVED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface DialogueLine {
  character: string;
  voiceId?: string;
  text: string;
  emotion?: string;
}

export interface Scene {
  id: string;
  episodeId: string;
  scriptId: string;
  order: number;
  title: string | null;
  narration: string | null;
  duration: number | null;
  emotion: string | null;
  background: string | null;
  cameraDirection: string | null;
  motionEffect: string | null;
  motionPrompt: string | null;
  dialogueJson: string | null;
  status: SceneStatus;
  createdAt: string;
  updatedAt: string;
  images?: SceneImage[];
  voices?: SceneVoice[];
}

export interface SceneImage {
  id: string;
  sceneId: string;
  imageUrl: string | null;
  prompt: string | null;
  negativePrompt: string | null;
  model: string | null;
  width: number | null;
  height: number | null;
  isSelected: boolean;
  createdAt: string;
}

export interface SceneVoice {
  id: string;
  sceneId: string;
  characterId: string | null;
  text: string;
  voiceProvider: string | null;
  voiceId: string | null;
  audioUrl: string | null;
  duration: number | null;
  isSelected: boolean;
  createdAt: string;
}

export interface VideoClip {
  id: string;
  sceneId: string;
  videoUrl: string | null;
  duration: number | null;
  resolution: string | null;
  isSelected: boolean;
  createdAt: string;
}

export interface SceneAnimatedClip {
  id: string;
  sceneId: string;
  videoUrl: string;
  provider: string;
  duration: number | null;
  aspectRatio: string;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  seriesId: string;
  name: string;
  description: string | null;
  age: number | null;
  gender: string | null;
  personality: string | null;
  basePrompt: string | null;
  thumbnail: string | null;
  voiceType: string | null;
  typecastVoiceType: string | null;
  createdAt: string;
  updatedAt: string;
  references?: CharacterReference[];
}

export interface CharacterReference {
  id: string;
  characterId: string;
  imageUrl: string;
  type: 'FRONT' | 'LEFT' | 'RIGHT' | 'BACK' | 'FULL' | 'CUSTOM';
  label: string | null;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  type: JobType;
  targetType: string;
  targetId: string;
  bullJobId: string | null;
  status: JobStatus;
  progress: number;
  error: string | null;
  payload: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinalVideo {
  id: string;
  episodeId: string;
  videoUrl: string | null;
  thumbnail: string | null;
  duration: number | null;
  resolution: string | null;
  status: FinalVideoStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Request DTOs ────────────────────────────────────────────
export interface CreateSeriesDto {
  title: string;
  description?: string;
  stylePrompt?: string;
}

export interface UpdateSeriesDto {
  title?: string;
  description?: string;
  stylePrompt?: string;
  thumbnail?: string;
}

export interface CreateEpisodeDto {
  title: string;
  description?: string;
  episodeNumber?: number;
}

export interface UpdateEpisodeDto {
  title?: string;
  description?: string;
  status?: EpisodeStatus;
}

export interface GenerateScriptDto {
  topic?: string;
  additionalInstructions?: string;
}

export interface UpdateScriptDto {
  content?: string;
  summary?: string;
  status?: 'DRAFT' | 'GENERATING' | 'READY' | 'APPROVED' | 'FAILED';
}

export interface GenerateSceneImageDto {
  prompt?: string;
  negativePrompt?: string;
  style?: string;
  width?: number;
  height?: number;
}

export interface GenerateTtsDto {
  voiceId?: string;
  characterId?: string;
}

export interface ImageToVideoDto {
  motionPrompt?: string;
  duration?: 5 | 10;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface RenderClipDto {
  motionEffect?: string;
}

export interface CreateCharacterDto {
  name: string;
  description?: string;
  age?: number;
  gender?: string;
  personality?: string;
  basePrompt?: string;
  voiceType?: string;
  typecastVoiceType?: string;
}

export interface UpdateSceneDto {
  title?: string;
  narration?: string;
  duration?: number;
  emotion?: string;
  background?: string;
  cameraDirection?: string;
  motionEffect?: string;
  motionPrompt?: string;
  dialogueJson?: string;
}

// ── Response wrappers ───────────────────────────────────────
export interface JobResponse {
  jobId: string;
}

export interface QueueStats {
  [queueName: string]: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
}
