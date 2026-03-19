import { api } from '../api-client';
import { CreatePostInput } from '../types';

export async function createPost(input: CreatePostInput) {
  let imageUrl: string | undefined;
  let caption = input.caption;
  let hashtags = input.hashtags;

  if (input.image_prompt) {
    const img = await api.generateImage({ prompt: input.image_prompt });
    imageUrl = img.imageUrl;
  }

  if (!caption) {
    const topic = input.image_prompt || 'post de tecnologia';
    const result = await api.generateCaption({ topic, tone: input.tone });
    caption = result.caption;
    hashtags = hashtags || result.hashtags;
  }

  const post = (await api.createPost({
    caption,
    imageUrl,
    hashtags,
    source: 'MCP',
    ...(input.scheduled_at ? { scheduledAt: input.scheduled_at } : {}),
  })) as any;

  return { post_id: post.id, caption: post.caption, image_url: post.imageUrl, status: post.status };
}
