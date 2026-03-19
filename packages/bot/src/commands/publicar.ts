import { Context } from 'grammy';
import { api } from '../api-client';

export async function publicarCommand(ctx: Context) {
  const text = ctx.message?.text || '';
  const id = text.replace(/^\/publicar\s*/, '').trim();

  if (!id) {
    await ctx.reply('Use: /publicar [id do post]');
    return;
  }

  await ctx.reply('Publicando...');

  try {
    await api.publishPost(id);
    await ctx.reply('Post publicado com sucesso!');
  } catch (err) {
    await ctx.reply('Erro ao publicar post.');
  }
}
