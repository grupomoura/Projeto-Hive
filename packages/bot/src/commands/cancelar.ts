import { Context } from 'grammy';
import { api } from '../api-client';

export async function cancelarCommand(ctx: Context) {
  const text = ctx.message?.text || '';
  const id = text.replace(/^\/cancelar\s*/, '').trim();

  if (!id) {
    await ctx.reply(
      '❌ *Cancelar Post*\n\n' +
      'Use: `/cancelar [id do post]`\n\n' +
      '💡 Use /listar para ver os IDs dos posts agendados.',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  try {
    await api.cancelPost(id);
    await ctx.reply(`✅ *Post cancelado com sucesso!*\n\n🆔 ID: \`${id}\``, { parse_mode: 'Markdown' });
  } catch (err) {
    await ctx.reply('❌ Erro ao cancelar post. Verifique o ID e tente novamente.');
  }
}
