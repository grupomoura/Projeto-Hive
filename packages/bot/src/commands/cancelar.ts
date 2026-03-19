import { Context } from 'grammy';
import { api } from '../api-client';

export async function cancelarCommand(ctx: Context) {
  const text = ctx.message?.text || '';
  const id = text.replace(/^\/cancelar\s*/, '').trim();

  if (!id) {
    await ctx.reply('Use: /cancelar [id do post]');
    return;
  }

  try {
    await api.cancelPost(id);
    await ctx.reply('Post cancelado com sucesso!');
  } catch (err) {
    await ctx.reply('Erro ao cancelar post.');
  }
}
