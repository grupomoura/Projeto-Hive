import { Context } from 'grammy';
import { api } from '../api-client';

export async function agendarCommand(ctx: Context) {
  const text = ctx.message?.text || '';
  const parts = text.replace(/^\/agendar\s*/, '').trim().split(' ');

  if (parts.length < 3) {
    await ctx.reply(
      '📅 *Agendar Post*\n\n' +
      'Use: `/agendar [id] [YYYY-MM-DD] [HH:mm]`\n\n' +
      '📝 *Exemplo:*\n' +
      '`/agendar abc123 2026-03-20 10:00`\n\n' +
      '💡 Use /listar para ver os IDs dos posts.',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  const [id, date, time] = parts;
  const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
  const formatted = new Date(scheduledAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  try {
    await api.schedulePost(id, scheduledAt);
    await ctx.reply(`✅ *Post agendado com sucesso!*\n\n📅 Data: ${formatted}\n🆔 ID: \`${id}\``, { parse_mode: 'Markdown' });
  } catch (err) {
    await ctx.reply('❌ Erro ao agendar post. Verifique o ID e tente novamente.');
  }
}
