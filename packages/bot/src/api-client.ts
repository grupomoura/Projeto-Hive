const API_URL = process.env.API_URL || 'http://localhost:3001';
const API_TOKEN = process.env.API_TOKEN || '';

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as any).error || 'API request failed');
  return (data as any).data;
}

export const api = {
  createPost: (body: Record<string, unknown>) => request('/api/posts', { method: 'POST', body: JSON.stringify(body) }),

  listPosts: (status?: string) => request<{ items: any[]; total: number }>(`/api/posts?status=${status || ''}&limit=10`),

  publishPost: (id: string) => request(`/api/posts/${id}/publish`, { method: 'POST' }),

  schedulePost: (id: string, scheduledAt: string) =>
    request(`/api/posts/${id}/schedule`, { method: 'POST', body: JSON.stringify({ scheduledAt }) }),

  cancelPost: (id: string) => request(`/api/posts/${id}`, { method: 'DELETE' }),

  generateImage: (prompt: string, aspectRatio = '1:1') =>
    request<{ imageUrl: string }>('/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({ prompt, aspectRatio }),
    }),

  generateCaption: (topic: string, tone?: string) =>
    request<{ caption: string; hashtags: string[] }>('/api/generate/caption', {
      method: 'POST',
      body: JSON.stringify({ topic, tone }),
    }),

  instagramStatus: () => request<{ connected: boolean }>('/api/instagram/status'),
};
