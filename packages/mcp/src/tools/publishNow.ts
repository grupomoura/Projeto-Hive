import { api } from '../api-client';
import { PublishNowInput } from '../types';

export async function publishNow(input: PublishNowInput) {
  const result = (await api.publishPost(input.post_id)) as any;
  return { instagram_id: result.instagramId, published_at: new Date().toISOString() };
}
