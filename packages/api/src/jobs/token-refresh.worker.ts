import { Worker, Queue } from 'bullmq';
import { redis } from '../config/redis';
import { prisma } from '../config/database';

const tokenQueue = new Queue('token-refresh-queue', { connection: redis });

// Schedule token refresh every 50 days
export async function initTokenRefreshJob() {
  const existing = await tokenQueue.getRepeatableJobs();
  if (existing.length === 0) {
    await tokenQueue.add('refresh', {}, { repeat: { every: 50 * 24 * 60 * 60 * 1000 } });
  }
}

export const tokenRefreshWorker = new Worker(
  'token-refresh-queue',
  async () => {
    const tokens = await prisma.instagramToken.findMany();

    for (const token of tokens) {
      try {
        const res = await fetch(
          `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token.accessToken}`,
        );
        const data = (await res.json()) as { access_token?: string; expires_in?: number };

        if (data.access_token) {
          await prisma.instagramToken.update({
            where: { id: token.id },
            data: {
              accessToken: data.access_token,
              expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000),
              refreshedAt: new Date(),
            },
          });
        }
      } catch (err) {
        console.error(`Failed to refresh token ${token.id}:`, err);
      }
    }
  },
  { connection: redis },
);
