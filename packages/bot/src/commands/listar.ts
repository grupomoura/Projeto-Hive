import { Context } from 'grammy';
import { api } from '../api-client';

export async function listarCommand(ctx: Context) {
  try {
    const result = await api.listPosts('SCHEDULED');
    if (!result.items.length) {
      await ctx.reply('Nenhum post agendado.');
      return;
    }

    const list = result.items
      .map((p: any, i: number) => {
        const date = p.scheduledAt ? new Date(p.scheduledAt).toLocaleString('pt-BR') : 'Sem data';
        const caption = p.caption ? p.caption.slice(0, 50) + '...' : 'Sem legenda';
        return `${i + 1}. [${p.status}] ${caption}\n   ID: ${p.id}\n   Data: ${date}`;
      })
      .join('\n\n');

    await ctx.reply(`Posts agendados (${result.total}):\n\n${list}`);
  } catch (err) {
    await ctx.reply('Erro ao listar posts.');
  }
}
