import { api } from '../api-client';

export async function listVideoClips(input: {
  status?: string;
  page?: string;
  limit?: string;
}) {
  const params: Record<string, string> = {};
  if (input.status) params.status = input.status;
  if (input.page) params.page = input.page;
  if (input.limit) params.limit = input.limit;

  const result = (await api.listVideoClips(params)) as any;

  return {
    items: (result.items || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      source_url: c.sourceUrl,
      status: c.status,
      language: c.language,
      duration: c.duration,
      moments_count: Array.isArray(c.moments) ? c.moments.length : 0,
      clips_count: Array.isArray(c.clips) ? c.clips.length : 0,
      created_at: c.createdAt,
    })),
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}
