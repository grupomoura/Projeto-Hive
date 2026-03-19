import { prisma } from '../config/database';
import { env } from '../config/env';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * If imageUrl is localhost (MinIO local), upload to a public host
 * so Instagram can download it.
 */
async function getPublicImageUrl(imageUrl: string): Promise<string> {
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\//.test(imageUrl);
  if (!isLocal) return imageUrl;

  console.log('[Instagram] Image is localhost, uploading to public host...');
  console.log('[Instagram] Local URL:', imageUrl);

  // Download from local MinIO
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to download local image: ${imgRes.status}`);
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  // Upload to catbox.moe (free, no API key needed, 200MB limit)
  const formData = new FormData();
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, 'image.jpg');

  const uploadRes = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Catbox upload failed: ${uploadRes.status} ${errText}`);
  }

  const publicUrl = await uploadRes.text();
  if (!publicUrl.startsWith('http')) {
    throw new Error(`Catbox upload returned invalid URL: ${publicUrl}`);
  }

  console.log('[Instagram] Public URL:', publicUrl);
  return publicUrl;
}

export async function publishToInstagram(postId: string) {
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId } });

  if (!post.imageUrl) throw new Error('Post has no image');
  if (!env.INSTAGRAM_ACCESS_TOKEN || !env.INSTAGRAM_USER_ID) {
    throw new Error('Instagram credentials not configured');
  }

  const token = env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = env.INSTAGRAM_USER_ID;

  // Get a publicly accessible image URL
  const publicImageUrl = await getPublicImageUrl(post.imageUrl);

  // Step 1: Create media container
  const caption = [post.caption, post.hashtags.map((h) => `#${h}`).join(' ')]
    .filter(Boolean)
    .join('\n\n');

  console.log('[Instagram] Creating media container...');
  console.log('[Instagram] User ID:', igUserId);
  console.log('[Instagram] Image URL:', publicImageUrl);

  const createRes = await fetch(`https://graph.instagram.com/v21.0/${igUserId}/media`, {
    method: 'POST',
    body: new URLSearchParams({
      image_url: publicImageUrl,
      caption,
      access_token: token,
    }),
  });
  const createData = (await createRes.json()) as any;
  const containerId = createData.id;

  console.log('[Instagram] Create container response:', JSON.stringify(createData));

  if (!containerId) {
    throw new Error(`Failed to create media container: ${JSON.stringify(createData)}`);
  }

  // Step 2: Poll until FINISHED
  console.log('[Instagram] Polling media status...');
  let status = 'IN_PROGRESS';
  let attempts = 0;
  while (status !== 'FINISHED' && attempts < 20) {
    await sleep(3000);
    const check = await fetch(
      `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${token}`,
    );
    const checkData = (await check.json()) as any;
    status = checkData.status_code;
    console.log(`[Instagram] Poll #${attempts + 1}: ${status}`);
    if (status === 'ERROR') {
      throw new Error(`Media processing failed: ${JSON.stringify(checkData)}`);
    }
    attempts++;
  }

  if (status !== 'FINISHED') throw new Error('Media processing timeout after 60s');

  // Step 3: Publish
  console.log('[Instagram] Publishing media...');
  const publishRes = await fetch(`https://graph.instagram.com/v21.0/${igUserId}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({
      creation_id: containerId,
      access_token: token,
    }),
  });
  const result = (await publishRes.json()) as any;

  console.log('[Instagram] Publish response:', JSON.stringify(result));

  if (!result.id) {
    throw new Error(`Failed to publish post: ${JSON.stringify(result)}`);
  }

  return { id: result.id };
}
