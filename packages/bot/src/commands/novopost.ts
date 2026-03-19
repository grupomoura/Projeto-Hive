import { Context } from 'grammy';

export async function novopostCommand(ctx: Context) {
  await ctx.reply(
    'Vamos criar um novo post!\n\nEnvie o tema ou descricao do post que deseja criar.\n\nExemplo: "Post sobre as novidades do Claude 4 para desenvolvedores"',
  );
}
