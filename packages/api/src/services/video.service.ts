import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const videoQueue = new Queue('video-queue', { connection: redis });

export async function queueAnalysis(videoClipId: string, options: { whisperModel?: string; maxMoments?: number; language?: string }) {
  await videoQueue.add(
    'analyze',
    { videoClipId, ...options },
    { jobId: `video-analyze-${videoClipId}-${Date.now()}`, attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
  );
}

export async function queueClipping(
  videoClipId: string,
  clips: Array<{ start: number; end: number; title?: string }>,
  options: { format?: string; burnSubs?: boolean; whisperModel?: string; language?: string },
) {
  await videoQueue.add(
    'clip',
    { videoClipId, clips, ...options },
    { jobId: `video-clip-${videoClipId}-${Date.now()}`, attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
  );
}
