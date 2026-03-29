import { Context } from 'grammy';
import { api } from './api-client';
import { sendPhoto } from './utils/send-photo';

export async function handleCallbackQuery(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const [action, ...idParts] = data.split('_');
  const postId = idParts.join('_');

  try {
    switch (action) {
      case 'approve':
        await ctx.answerCallbackQuery({ text: 'Post aprovado!' });
        await ctx.reply(
          `✅ *Post aprovado e salvo como rascunho!*\n\n` +
          `🆔 ID: \`${postId}\`\n\n` +
          `O que deseja fazer agora?\n` +
          `• /publicar ${postId} — Publicar agora\n` +
          `• /agendar ${postId} YYYY-MM-DD HH:mm — Agendar`,
          { parse_mode: 'Markdown' },
        );
        break;

      case 'publish':
        await ctx.answerCallbackQuery({ text: 'Publicando...' });
        await api.publishPost(postId);
        await ctx.reply('✅ *Post enviado para publicacao no Instagram!*\n\nVoce sera notificado quando finalizar.', { parse_mode: 'Markdown' });
        break;

      case 'regen':
        await ctx.answerCallbackQuery({ text: 'Gerando nova imagem...' });
        await ctx.reply('⏳ Gerando nova imagem com IA... Aguarde.');
        try {
          const postData = (await api.getPost(postId)) as any;
          const regenPrompt = postData?.nanoPrompt || 'Regenerate post image';
          const result = await api.generateImage(regenPrompt, postData?.aspectRatio);

          if (postData?.isCarousel) {
            await api.addImageToPost(postId, { imageUrl: result.imageUrl });
            await sendPhoto(ctx, result.imageUrl, { caption: '✅ Nova imagem adicionada ao carrossel!' });
          } else {
            await api.updatePost(postId, { imageUrl: result.imageUrl });
            await sendPhoto(ctx, result.imageUrl, { caption: '✅ Imagem do post atualizada!' });
          }
        } catch {
          await ctx.reply('❌ Erro ao gerar nova imagem. Tente novamente.');
        }
        break;

      case 'schedule': {
        await ctx.answerCallbackQuery({ text: 'Agendando...' });
        const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await api.schedulePost(postId, scheduledAt);
        const formatted = new Date(scheduledAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        await ctx.reply(
          `📅 *Post agendado!*\n\n` +
          `🕐 Data: ${formatted}\n` +
          `🆔 ID: \`${postId}\`\n\n` +
          `💡 Para alterar: /agendar ${postId} YYYY-MM-DD HH:mm`,
          { parse_mode: 'Markdown' },
        );
        break;
      }

      case 'cancel':
        await ctx.answerCallbackQuery({ text: 'Cancelado' });
        await api.cancelPost(postId);
        await ctx.reply('🗑 *Post cancelado e removido.*', { parse_mode: 'Markdown' });
        break;

      default:
        await ctx.answerCallbackQuery({ text: 'Acao desconhecida' });
    }
  } catch (err) {
    await ctx.answerCallbackQuery({ text: 'Erro ao processar' });
    await ctx.reply('❌ Ocorreu um erro. Tente novamente.');
  }
}
