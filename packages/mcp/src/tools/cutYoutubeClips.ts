import { api } from '../api-client';

export async function cutYoutubeClips(input: {
  video_clip_id: string;
  clips: Array<{ start: number; end: number; title?: string }>;
  format?: string;
  burn_subs?: boolean;
}) {
  const result = (await api.cutVideoClips(input.video_clip_id, {
    clips: input.clips,
    format: input.format || 'vertical',
    burnSubs: input.burn_subs || false,
  })) as any;

  return {
    video_clip_id: result.id,
    status: result.status,
    message: result.message || 'Corte iniciado. Use get_video_clip para acompanhar o progresso.',
  };
}
