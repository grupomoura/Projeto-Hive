import { Context } from 'grammy';
import { InlineKeyboard } from 'grammy';
import { api } from '../api-client';
import { sendPhoto, sendMediaGroup } from '../utils/send-photo';

const VALID_RATIOS = ['1:1', '4:5', '9:16'];

function parseCommand(text: string): { tema: string; aspectRatio: string; count: number } {
  const args = text.replace(/^\/gerar\s*/, '').trim();
  const words = args.split(/\s+/);

  let aspectRatio = '1:1';
  let count = 1;
  let startIdx = 0;

  if (VALID_RATIOS.includes(words[0])) {
    aspectRatio = words[0];
    startIdx = 1;
  }

  const maybeCount = parseInt(words[startIdx], 10);
  if (!isNaN(maybeCount) && maybeCount >= 2 && maybeCount <= 10) {
    count = maybeCount;
    startIdx++;
  }

  const tema = words.slice(startIdx).join(' ');
  return { aspectRatio, tema, count };
}

export async function gerarCommand(ctx: Context) {
  const text = ctx.message?.text || '';
  const { tema, aspectRatio, count } = parseCommand(text);

  if (!tema) {
    await ctx.reply(
      '🎨 *Gerar Post com IA*\n\n' +
      'Use: `/gerar [tamanho] [N] [tema]`\n\n' +
      '📐 *Tamanhos disponiveis:*\n' +
      '• `1:1` — Feed (padrao)\n' +
      '• `4:5` — Retrato\n' +
      '• `9:16` — Stories/Reels\n\n' +
      '🎠 *Carrossel:* adicione um numero (2-10)\n\n' +
      '📝 *Exemplos:*\n' +
      '• `/gerar novidades do Claude 4`\n' +
      '• `/gerar 3 dicas de produtividade`\n' +
      '• `/gerar 4:5 5 receitas saudaveis`',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  const isCarousel = count >= 2;
  const ratioLabel = aspectRatio === '4:5' ? 'Retrato' : aspectRatio === '9:16' ? 'Stories' : 'Feed';

  await ctx.reply(
    `⏳ *Gerando post...*\n\n` +
    `📝 Tema: _${tema}_\n` +
    `📐 Formato: ${ratioLabel} (${aspectRatio})\n` +
    `🖼 Imagens: ${isCarousel ? count + ' (carrossel)' : '1'}\n\n` +
    `Aguarde um momento...`,
    { parse_mode: 'Markdown' },
  );

  try {
    const imagePromises = Array.from({ length: count }, (_, i) =>
      api.generateImage(
        count > 1 ? `${tema} - variacao ${i + 1} de ${count}` : tema,
        aspectRatio,
      ),
    );

    const [captionSettled, ...imageSettled] = await Promise.all([
      api.generateCaption(tema).catch(() => null),
      ...imagePromises.map((p) => p.catch(() => null)),
    ]);

    const captionResult = captionSettled;
    const successfulImages = imageSettled.filter((r): r is { imageUrl: string } => !!r?.imageUrl);

    if (successfulImages.length === 0 && !captionResult) {
      await ctx.reply('❌ Nao foi possivel gerar imagem nem legenda. Tente novamente em alguns minutos.');
      return;
    }

    const caption = captionResult?.caption || tema;
    const hashtags = captionResult?.hashtags || [];

    const postPayload: Record<string, unknown> = {
      caption,
      hashtags,
      nanoPrompt: tema,
      source: 'TELEGRAM',
      aspectRatio,
    };

    if (successfulImages.length >= 2) {
      postPayload.isCarousel = true;
      postPayload.images = successfulImages.map((img, idx) => ({ imageUrl: img.imageUrl, order: idx }));
    } else if (successfulImages.length === 1) {
      postPayload.imageUrl = successfulImages[0].imageUrl;
    }

    const post = (await api.createPost(postPayload)) as any;

    const keyboard = new InlineKeyboard()
      .text('✅ Aprovar', `approve_${post.id}`)
      .text('🔄 Nova Imagem', `regen_${post.id}`)
      .row()
      .text('📤 Publicar Agora', `publish_${post.id}`)
      .text('📅 Agendar', `schedule_${post.id}`)
      .row()
      .text('❌ Cancelar', `cancel_${post.id}`);

    const captionText = `${caption}\n\n${hashtags.map((h: string) => `#${h}`).join(' ')}`;

    let statusMsg = '';
    if (isCarousel && successfulImages.length < count) {
      statusMsg = `\n\n⚠️ ${successfulImages.length}/${count} imagens geradas (algumas falharam).`;
    }
    if (successfulImages.length === 0) {
      statusMsg = '\n\n⚠️ Imagem indisponivel (IA sobrecarregada). Use "Nova Imagem" para tentar novamente.';
    }

    if (successfulImages.length >= 2) {
      await sendMediaGroup(ctx, successfulImages.map((img) => img.imageUrl), (captionText + statusMsg).slice(0, 1024));
      await ctx.reply(`✅ Carrossel com ${successfulImages.length} imagens criado!`, { reply_markup: keyboard });
    } else if (successfulImages.length === 1) {
      await sendPhoto(ctx, successfulImages[0].imageUrl, {
        caption: (captionText + statusMsg).slice(0, 1024),
        reply_markup: keyboard,
      });
    } else {
      await ctx.reply(captionText + statusMsg, { reply_markup: keyboard });
    }
  } catch (err: any) {
    console.error('[Bot] /gerar failed:', err.message);
    await ctx.reply('❌ Erro ao gerar post. Tente novamente.');
  }
}
