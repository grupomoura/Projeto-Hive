import { Context } from 'grammy';
import { InlineKeyboard } from 'grammy';
import { api } from '../api-client';
import { sendPhoto } from '../utils/send-photo';

const VALID_RATIOS = ['1:1', '4:5', '9:16'];

function parseCommand(text: string): { tema: string; aspectRatio: string } {
  const args = text.replace(/^\/gerar\s*/, '').trim();
  const firstWord = args.split(/\s+/)[0];
  if (VALID_RATIOS.includes(firstWord)) {
    return { aspectRatio: firstWord, tema: args.slice(firstWord.length).trim() };
  }
  return { aspectRatio: '1:1', tema: args };
}

export async function gerarCommand(ctx: Context) {
  const text = ctx.message?.text || '';
  const { tema, aspectRatio } = parseCommand(text);

  if (!tema) {
    await ctx.reply(
      'Use: /gerar [tamanho] [tema do post]\n\n' +
      'Tamanhos aceitos:\n' +
      '  1:1  - Feed (padrao)\n' +
      '  4:5  - Retrato\n' +
      '  9:16 - Stories/Reels\n\n' +
      'Exemplos:\n' +
      '  /gerar novidades do Claude 4\n' +
      '  /gerar 4:5 cachorro fofo\n' +
      '  /gerar 9:16 promo de verao'
    );
    return;
  }

  const ratioLabel = aspectRatio === '4:5' ? 'Retrato' : aspectRatio === '9:16' ? 'Stories' : 'Feed';
  await ctx.reply(`Gerando imagem (${ratioLabel} ${aspectRatio}) e legenda... Aguarde.`);

  try {
    const [imageResult, captionResult] = await Promise.all([
      api.generateImage(tema, aspectRatio),
      api.generateCaption(tema),
    ]);

    const post = (await api.createPost({
      caption: captionResult.caption,
      imageUrl: imageResult.imageUrl,
      hashtags: captionResult.hashtags,
      nanoPrompt: tema,
      source: 'TELEGRAM',
      aspectRatio,
    })) as any;

    const keyboard = new InlineKeyboard()
      .text('Aprovar', `approve_${post.id}`)
      .text('Nova Imagem', `regen_${post.id}`)
      .row()
      .text('Publicar Agora', `publish_${post.id}`)
      .text('Agendar', `schedule_${post.id}`)
      .row()
      .text('Cancelar', `cancel_${post.id}`);

    const captionText = `${captionResult.caption}\n\n${captionResult.hashtags.map((h: string) => `#${h}`).join(' ')}`;

    if (imageResult.imageUrl) {
      await sendPhoto(ctx, imageResult.imageUrl, {
        caption: captionText.slice(0, 1024),
        reply_markup: keyboard,
      });
    } else {
      await ctx.reply(captionText, { reply_markup: keyboard });
    }
  } catch (err) {
    await ctx.reply('Erro ao gerar post. Tente novamente.');
  }
}
