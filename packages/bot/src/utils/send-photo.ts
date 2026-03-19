import { Context, InputFile } from 'grammy';

/**
 * Downloads an image from a URL and sends it as a photo via Telegram.
 * Telegram cannot access localhost URLs, so we download and send as buffer.
 */
export async function sendPhoto(
  ctx: Context,
  imageUrl: string,
  options: { caption?: string; reply_markup?: any } = {}
) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const file = new InputFile(buffer, 'post.jpg');
  await ctx.replyWithPhoto(file, options);
}
