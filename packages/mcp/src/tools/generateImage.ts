import { api } from '../api-client';
import { GenerateImageInput } from '../types';

export async function generateImage(input: GenerateImageInput) {
  const result = await api.generateImage({
    prompt: input.prompt,
    style: input.style,
    aspectRatio: input.aspect_ratio,
  });
  return { image_url: result.imageUrl };
}
