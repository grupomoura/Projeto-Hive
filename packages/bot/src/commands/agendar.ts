import { Context } from 'grammy';
import { api } from '../api-client';

export async function agendarCommand(ctx: Context) {
  const text = ctx.message?.text || '';
  const parts = text.replace(/^\/agendar\s*/, '').trim().split(' ');

  if (parts.length < 3) {
    await ctx.reply('Use: /agendar [id] [YYYY-MM-DD] [HH:mm]\nExemplo: /agendar abc123 2026-03-20 10:00');
    return;
  }

  const [id, date, time] = parts;
  const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

  try {
    await api.schedulePost(id, scheduledAt);
    await ctx.reply(`Post agendado para ${date} as ${time}!`);
  } catch (err) {
    await ctx.reply('Erro ao agendar post.');
  }
}
