import { api } from '../api-client';
import { UploadImageInput } from '../types';

export async function uploadImage(input: UploadImageInput) {
  const result = await api.uploadImage(input.image_base64, input.filename);
  return { image_url: result.imageUrl };
}
