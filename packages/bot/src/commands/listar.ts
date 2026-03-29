import { Context } from 'grammy';
import { api } from '../api-client';

export async function listarCommand(ctx: Context) {
  try {
    const result = await api.listPosts('SCHEDULED');

    if (!result.items.length) {
      await ctx.reply(
        '📅 *Posts Agendados*\n\n' +
        'Nenhum post agendado no momento.\n\n' +
        '💡 Use /gerar \\[tema] para criar um post e depois agende com o botao.',
        { parse_mode: 'Markdown' },
      );
      return;
    }

    const list = result.items.map((p: any, i: number) => {
      const date = p.scheduledAt
        ? new Date(p.scheduledAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Sem data';
      const caption = p.caption ? p.caption.slice(0, 60) + '...' : 'Sem legenda';
      const carousel = p.isCarousel ? ' 🎠' : '';
      return `*${i + 1}.* ${caption}${carousel}\n   📅 ${date}\n   🆔 \`${p.id}\``;
    }).join('\n\n');

    await ctx.reply(
      `📅 *Posts Agendados (${result.total})*\n\n${list}\n\n` +
      '💡 Use /publicar \\[id] para publicar agora\n' +
      '💡 Use /cancelar \\[id] para cancelar',
      { parse_mode: 'Markdown' },
    );
  } catch (err) {
    await ctx.reply('❌ Erro ao listar posts. Verifique se a API esta rodando.');
  }
}
