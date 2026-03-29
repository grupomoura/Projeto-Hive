import { Context } from 'grammy';

export async function novopostCommand(ctx: Context) {
  await ctx.reply(
    '✏️ *Criar Novo Post*\n\n' +
    'Envie o tema ou descricao do post que deseja criar.\n\n' +
    '📝 *Exemplos:*\n' +
    '• _Post sobre as novidades do Claude 4 para desenvolvedores_\n' +
    '• _5 dicas de produtividade para empreendedores_\n' +
    '• _Lancamento de produto: curso de marketing digital_\n\n' +
    '💡 Ou use /gerar \\[tema] para gerar imagem + legenda automaticamente.',
    { parse_mode: 'Markdown' },
  );
}
