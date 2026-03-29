import { Context } from 'grammy';
import { api } from '../api-client';

export async function publicarCommand(ctx: Context) {
  const text = ctx.message?.text || '';
  const id = text.replace(/^\/publicar\s*/, '').trim();

  if (!id) {
    await ctx.reply(
      '📤 *Publicar Post*\n\n' +
      'Use: `/publicar [id do post]`\n\n' +
      '💡 Use /listar para ver os IDs dos posts.',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  await ctx.reply('⏳ Publicando no Instagram...');

  try {
    await api.publishPost(id);
    await ctx.reply(`✅ *Post publicado com sucesso!*\n\n🆔 ID: \`${id}\``, { parse_mode: 'Markdown' });
  } catch (err) {
    await ctx.reply('❌ Erro ao publicar. Verifique se o Instagram esta conectado em Configuracoes.');
  }
}
