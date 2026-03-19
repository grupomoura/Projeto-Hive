import { api } from '../api-client';
import { GenerateCaptionInput } from '../types';

export async function generateCaption(input: GenerateCaptionInput) {
  const result = await api.generateCaption({
    topic: input.topic,
    tone: input.tone,
    hashtagsCount: input.hashtags_count,
    language: input.language,
    maxLength: input.max_length,
  });
  return { caption: result.caption, hashtags: result.hashtags };
}
