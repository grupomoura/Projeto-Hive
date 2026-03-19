import { Context } from 'grammy';
import { api } from '../api-client';

export async function statusCommand(ctx: Context) {
  try {
    const [igStatus, posts] = await Promise.all([
      api.instagramStatus(),
      api.listPosts('SCHEDULED'),
    ]);

    await ctx.reply(
      `Status InstaPost AI:\n\n` +
        `Instagram: ${igStatus.connected ? 'Conectado' : 'Desconectado'}\n` +
        `Posts agendados: ${posts.total}\n` +
        (posts.items[0]
          ? `Proximo post: ${new Date(posts.items[0].scheduledAt).toLocaleString('pt-BR')}`
          : 'Nenhum post agendado'),
    );
  } catch (err) {
    await ctx.reply('Erro ao verificar status.');
  }
}
