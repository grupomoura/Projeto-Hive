import { api } from '../api-client';
import { ListPostsInput } from '../types';

export async function listPosts(input: ListPostsInput) {
  const params: Record<string, string> = {};
  if (input.status) params.status = input.status;
  if (input.limit) params.limit = String(input.limit);
  if (input.offset) params.page = String(Math.floor(input.offset / (input.limit || 20)) + 1);

  const result = await api.listPosts(params);
  return { posts: result.items, total: result.total };
}
