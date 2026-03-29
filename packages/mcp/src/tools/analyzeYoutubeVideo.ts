import { api } from '../api-client';

export async function analyzeYoutubeVideo(input: {
  url: string;
  whisper_model?: string;
  max_moments?: number;
  language?: string;
}) {
  const result = (await api.analyzeVideo({
    url: input.url,
    whisperModel: input.whisper_model || 'tiny',
    maxMoments: input.max_moments || 10,
    language: input.language,
  })) as any;

  return {
    video_clip_id: result.id,
    status: result.status,
    message: result.message || 'Analise iniciada. Use get_video_clip para acompanhar o progresso.',
  };
}
