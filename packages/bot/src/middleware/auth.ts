import { Context, NextFunction } from 'grammy';

const allowedChatIds = (process.env.TELEGRAM_ALLOWED_CHAT_IDS || '')
  .split(',')
  .filter(Boolean)
  .map(Number);

export async function authMiddleware(ctx: Context, next: NextFunction) {
  const chatId = ctx.chat?.id;
  if (!chatId || (allowedChatIds.length > 0 && !allowedChatIds.includes(chatId))) {
    await ctx.reply('Acesso nao autorizado.');
    return;
  }
  await next();
}
