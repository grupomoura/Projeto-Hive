# Roteiro: Eu Criei um App que Posta no Instagram com IA — Do Zero ao Deploy

## Dados do Vídeo

- **Título principal**: Eu Criei um App que Posta no Instagram com IA — Do Zero ao Deploy (e você também consegue)
- **Título alternativo**: Criei um Sistema que Gera Imagens com IA e Posta Sozinho no Instagram — Tutorial Completo
- **Duração alvo**: 1h30 — 2h (estilo "build with me" narrativo)
- **Formato**: Vídeo único longo, tela gravada + facecam, estilo documental de construção
- **Público**: Iniciantes em programação, vibe coders, criadores de conteúdo que querem automatizar
- **Thumbnail**: Fundo escuro, tela de código à esquerda, mockup de post Instagram à direita com ícone de robô/IA, texto em amarelo "POSTA SOZINHO" e sua expressão surpresa
- **Descrição YouTube (primeiras 2 linhas)**: "Construí do zero um app que gera imagens com IA, cria legendas e posta automaticamente no Instagram. Nesse vídeo eu mostro cada passo — e você pode fazer igual, mesmo sem saber programar."
- **Tags**: automação instagram, postar com ia, nano banana api, gemini imagem, tutorial programação, coolify deploy, vibe coding, telegram bot, claude code, mcp server, instagram graph api, minio, self hosted

---

## ESTRUTURA GERAL DO VÍDEO

```
00:00 — HOOK: O app funcionando ao vivo
01:30 — O que vamos construir (visão geral)
05:00 — BLOCO 1: A Base — Backend + Banco de Dados
25:00 — BLOCO 2: Nano Banana — IA que cria as imagens
38:00 — BLOCO 3: Instagram API — Publicando de verdade
50:00 — BLOCO 4: O Dashboard — Interface visual
65:00 — BLOCO 5: Bot do Telegram — Postando pelo celular
78:00 — BLOCO 6: Deploy na VPS com Coolify
90:00 — BLOCO 7: O resultado final funcionando
95:00 — Fechamento + o que vem depois
```

---

## HOOK (0:00 — 1:30)

### O que aparece na tela:

Tela do celular com o Telegram aberto. Você digita: "Cria um post sobre as novidades do Claude 4". Em 15 segundos, o bot responde com uma imagem profissional gerada por IA e uma legenda pronta. Você clica em "Publicar". Corta para o Instagram — o post aparece no feed, real, publicado.

### Script:

> "Olha isso aqui. Eu abri o Telegram, mandei uma mensagem... e em menos de 20 segundos o app criou essa imagem do zero usando inteligência artificial, escreveu a legenda inteira e postou no meu Instagram. Sozinho."
>
> *[pausa dramática, olha pra câmera]*
>
> "E sabe o que é mais louco? Eu construí isso do zero. Sem framework mágico, sem ferramenta pronta. E nesse vídeo eu vou te mostrar EXATAMENTE como eu fiz — passo a passo — pra você fazer igual."
>
> "Não importa se você tá começando agora em programação. Se você consegue seguir uma receita de bolo, você consegue construir isso."
>
> "E o melhor: tudo roda numa VPS baratinha, com ferramentas gratuitas e open source. Nada de pagar plano caro de SaaS."

> **Nota de edição**: Zoom na tela do Telegram quando a imagem aparece. Som de notificação. Transição rápida para o Instagram com efeito de "whoosh". Todo esse trecho tem que ser RÁPIDO e visual.

---

## INTRODUÇÃO: O QUE VAMOS CONSTRUIR (1:30 — 5:00)

### Script:

> "Antes de meter a mão no código, deixa eu te mostrar o quadro geral. O que a gente vai construir hoje se chama InstaPost AI."

*[Aparece diagrama animado na tela — pode ser um slide simples ou motion graphics]*

> "É um sistema com 5 partes:"
>
> "Primeiro: um **backend** — que é o cérebro de tudo. Ele recebe os pedidos, organiza os dados e faz tudo acontecer."
>
> "Segundo: a **Nano Banana API** — que é a inteligência artificial do Google, o Gemini, que vai gerar as imagens dos posts. Você manda um texto descrevendo o que quer e ela te devolve uma imagem profissional."
>
> "Terceiro: a **Instagram API** — a API oficial do Instagram que permite publicar posts diretamente, sem precisar abrir o app."
>
> "Quarto: um **dashboard web** — uma interface bonita onde você vê seus posts, agenda publicações e gerencia tudo."
>
> "E quinto: um **bot no Telegram** — pra você criar posts direto do celular, só mandando uma mensagem."
>
> "Tudo isso rodando numa VPS sua, com **Coolify** gerenciando os containers, **PostgreSQL** como banco de dados e **MinIO** guardando as imagens. Tudo self-hosted, tudo seu."
>
> *[olha pra câmera]*
>
> "Parece muita coisa? Parece. Mas eu vou construir cada pedaço na sua frente, explicando o porquê de cada decisão. No final desse vídeo, você vai ter um sistema completo funcionando."
>
> "Então pega um café, porque a gente vai ficar um tempo aqui juntos. Bora?"

> **Nota de edição**: Diagrama aparecendo peça por peça com animação suave. Cada componente acende quando mencionado. Música de fundo leve e tech.

---

## BLOCO 1: A BASE — Backend + Banco de Dados (5:00 — 25:00)

### Transição:

> "Vamos começar pelo coração de tudo: o backend. Pensa nele como o gerente de uma loja. Ele não faz tudo sozinho, mas ele coordena todo mundo."

---

### 1A: Criando o Projeto (5:00 — 10:00)

#### O que aparece na tela:
Terminal aberto, criando o projeto do zero.

#### Script:

> "A primeira coisa que eu preciso é criar a estrutura do projeto. E aqui já vem a primeira decisão: eu vou usar **Node.js com TypeScript**."
>
> "Se você nunca usou TypeScript, relaxa. Pensa nele como JavaScript, mas com superpoderes. Ele te avisa quando você tá fazendo besteira antes de rodar o código."

*[Mostra o terminal]*

> "Vou abrir o Claude Code aqui e pedir pra ele criar a estrutura inicial."

*[Digita o prompt no Claude Code referenciando ARCHITECTURE.md e PROMPT.md]*

> "Olha que lindo. Ele criou toda a estrutura de pastas: controllers, services, routes, middleware... Cada coisa no seu lugar."
>
> "Deixa eu te explicar rapidinho o que cada pasta faz:"
>
> **[Mostra a árvore de pastas na tela]**
>
> "**Config** — é onde ficam as configurações: conexão com o banco de dados, com o Redis, com o MinIO."
>
> "**Controllers** — recebem os pedidos que chegam da internet e direcionam pro lugar certo."
>
> "**Services** — é onde a mágica acontece. A lógica de gerar imagem, publicar no Instagram, agendar posts..."
>
> "**Routes** — definem os endereços. Tipo: se alguém acessar /api/posts, o que acontece?"
>
> "**Jobs** — tarefas que rodam em segundo plano, tipo publicar um post agendado."

> **Dica de gravação**: Mostrar o código aparecendo no VS Code ou Cursor. Ir destacando cada pasta com zoom. Ritmo calmo mas não arrastado.

---

### 1B: O Banco de Dados com Prisma (10:00 — 16:00)

#### Script:

> "Agora a gente precisa de um lugar pra guardar os dados. Cada post que você criar tem um monte de informação: a legenda, a imagem, o horário de publicação, se já foi publicado ou não..."
>
> "Pra isso eu vou usar o **PostgreSQL** — que é um dos bancos de dados mais usados do mundo — junto com o **Prisma**, que é tipo um tradutor entre o código e o banco."
>
> "Ao invés de escrever SQL na mão, eu descrevo o que quero num arquivo chamado schema e o Prisma faz o resto."

*[Mostra o schema.prisma na tela]*

> "Olha o modelo do Post aqui. Cada post tem:"
>
> "Um **id** único, a **caption** que é a legenda, a **imageUrl** que é onde a imagem tá guardada no MinIO, o **status** que pode ser rascunho, agendado, publicando, publicado ou falhou..."
>
> "E tem o campo **source** — que indica de onde o post veio. Pode ser do dashboard web, do Telegram, ou do Cowork via MCP."
>
> "Esse campo é importante porque depois a gente vai poder filtrar: 'me mostra só os posts que eu criei pelo Telegram'."

*[Roda o comando de migration]*

> "Agora eu rodo `npx prisma migrate dev` e... pronto. O banco de dados tá criado com todas as tabelas."

> **Nota de edição**: Split screen — código à esquerda, terminal à direita mostrando o migration rodando.

---

### 1C: Os Endpoints da API (16:00 — 22:00)

#### Script:

> "Com o banco pronto, preciso criar os 'endereços' da API — os endpoints. Pensa assim: cada endpoint é como uma porta de entrada. Você bate na porta certa e recebe o que precisa."

*[Mostra a tabela de endpoints]*

> "Eu tenho endpoints pra tudo:"
>
> "**POST /api/posts** — cria um novo post."
> "**GET /api/posts** — lista todos os posts."
> "**POST /api/generate/image** — pede pra IA gerar uma imagem."
> "**POST /api/posts/:id/publish** — publica no Instagram."
>
> "E por aí vai. Cada um desses tem validação com **Zod** — que garante que ninguém mande dados errados. Se você esquece a legenda, ele te avisa na hora."

*[Mostra um teste no Postman/Insomnia ou via curl]*

> "Vou testar aqui: criar um post com legenda e hashtags..."
>
> *[Mostra a resposta JSON]*
>
> "Voltou certinho. Post criado com status 'draft'. Já tá no banco de dados."

> **Dica de gravação**: Usar Insomnia ou Thunder Client (extensão do VS Code) para testar os endpoints visualmente. Mais bonito que curl pra quem tá começando.

---

### 1D: MinIO — O Storage das Imagens (22:00 — 25:00)

#### Script:

> "Antes de ir pra geração de imagens, preciso resolver um problema: onde guardar as imagens?"
>
> "A maioria das pessoas usaria o Amazon S3 ou o Cloudflare R2. Mas eu quero que TUDO rode na minha VPS, sem depender de ninguém."
>
> "Aí entra o **MinIO**. Ele é um storage de arquivos open source que funciona IGUALZINHO ao S3 da Amazon. Mesma API, mesmos comandos. Mas roda na sua máquina."

*[Mostra o MinIO console no browser]*

> "Olha que bonito o painel dele. Aqui eu vou criar um bucket chamado 'instapost-images'. Pensa no bucket como uma pasta gigante."
>
> "E o detalhe importante: as imagens precisam ser públicas. Porque depois, quando eu mandar publicar no Instagram, a API do Instagram vai precisar acessar a imagem por URL. Se ela for privada, não funciona."

*[Mostra o código do serviço de storage]*

> "No código, o upload é simples: recebe a imagem, gera um nome único, salva no MinIO e retorna a URL pública. Pronto."

> **Nota de edição**: Mostrar o console do MinIO brevemente — não ficar muito tempo, só o suficiente pra pessoa entender o que é.

---

## BLOCO 2: NANO BANANA — IA QUE CRIA AS IMAGENS (25:00 — 38:00)

### Transição:

> "Agora vem a parte que eu mais gosto desse projeto inteiro. A parte da **inteligência artificial**."
>
> *[Pausa, olha pra câmera]*
>
> "Você vai mandar um texto tipo 'post moderno sobre inteligência artificial com fundo escuro e elementos neon'... e a IA vai CRIAR essa imagem do zero. Em segundos."

---

### 2A: O que é Nano Banana (25:00 — 29:00)

#### Script:

> "Nano Banana é o nome que o Google deu pro sistema de geração de imagens do Gemini. É tipo o DALL-E da OpenAI ou o Midjourney, mas integrado com a API do Google."
>
> "Tem 3 modelos:"
>
> "O **Nano Banana** original — que usa o Gemini 2.5 Flash. Rápido, barato, bom pra maioria dos casos."
>
> "O **Nano Banana 2** — Gemini 3.1 Flash. Mais novo, melhor qualidade, suporta até 4K."
>
> "E o **Nano Banana Pro** — Gemini 3 Pro. O top de linha. Renderiza texto perfeitamente dentro da imagem. Ideal pra posts com frases."
>
> "Pra esse projeto, vou usar o Nano Banana 2 pelo custo-benefício. Cada imagem custa uns 2 centavos de dólar. E se você quiser testar de graça, o Google AI Studio dá 500 requisições por dia grátis."

*[Mostra exemplos de imagens geradas — antes/depois de prompts]*

> "Olha a qualidade disso. Isso aqui foi gerado com um prompt de uma linha."

> **Nota de edição**: Mostrar 4-5 exemplos de imagens geradas em sequência rápida, tipo montagem. Impacto visual.

---

### 2B: Implementando o Serviço (29:00 — 35:00)

#### Script:

> "Agora vou plugar isso no nosso backend."

*[Mostra o código do nanobana.service.ts]*

> "O serviço funciona assim:"
>
> "Primeiro, eu pego o prompt do usuário e **enriqueço** ele. Tipo, se você manda 'post sobre IA', eu transformo em 'Professional Instagram post, modern design, vibrant colors, about artificial intelligence, 1080x1080 pixels'. Isso faz a IA gerar imagens muito melhores."
>
> "Depois, faço a chamada pra API do Nano Banana. Mando o prompt, o formato — 1:1 pra feed, 9:16 pra stories — e espero a resposta."
>
> "A resposta vem como um buffer de imagem. Eu pego esse buffer, salvo no MinIO, e retorno a URL pública."
>
> "E implementei retry automático. Se a API der erro — que acontece às vezes — o sistema tenta de novo até 3 vezes antes de desistir."

*[Testa ao vivo: manda um prompt e mostra a imagem gerada]*

> "Vou testar agora ao vivo. Vou mandar: 'Minimalist tech post about vibe coding, dark background, neon accents, futuristic'..."
>
> *[Espera uns segundos]*
>
> "Olha isso. OLHA ISSO."
>
> *[Mostra a imagem gerada]*
>
> "Isso foi gerado em 8 segundos. E custa menos que um chiclete."

> **Nota de edição**: MOMENTO CHAVE DO VÍDEO. A reação ao ver a imagem gerada deve ser genuína e empolgada. Zoom na imagem. Pausa pra pessoa absorver.

---

### 2C: Prompts que Funcionam (35:00 — 38:00)

#### Script:

> "Um segredo que pouca gente fala: **o prompt é 90% do resultado**. Uma imagem ruim geralmente é culpa de um prompt ruim."
>
> "Então eu criei um sistema de templates. Dependendo do tipo de post, o backend escolhe um template diferente:"
>
> "Pra posts educativos: 'Clean infographic style, white background, organized layout...'"
>
> "Pra posts de notícias tech: 'Breaking news aesthetic, bold typography, dark mode...'"
>
> "Pra quotes motivacionais: 'Minimalist gradient background, centered text...'"
>
> "Você pode customizar esses templates. Mas os padrões já funcionam muito bem."

> **Dica de gravação**: Mostrar 3 imagens geradas com os 3 templates diferentes. Comparação visual lado a lado.

---

## BLOCO 3: INSTAGRAM API — PUBLICANDO DE VERDADE (38:00 — 50:00)

### Transição:

> "Temos backend, temos banco de dados, temos IA gerando imagens lindas. Agora falta o mais importante: **publicar de verdade no Instagram.**"

---

### 3A: Configurando a Instagram API (38:00 — 43:00)

#### Script:

> "A API do Instagram é oficial, do Meta. Mas ela tem um setup meio burocrático. Não é difícil, é só chato. Então vou te guiar por cada passo."
>
> "Primeira coisa: você precisa de uma **conta Instagram Business ou Creator**. Conta pessoal não funciona com a API."

*[Mostra o Instagram > Configurações > Mudar para conta profissional]*

> "Segundo: vincular essa conta a uma **Página do Facebook**. Eu sei, parece estranho, mas é assim que o Meta funciona."
>
> "Terceiro: criar um **App no Meta Developer Portal**."

*[Mostra o developers.facebook.com]*

> "Aqui você cria o app, adiciona o produto 'Instagram Graph API', e configura as permissões: `instagram_basic`, `instagram_content_publish` e `pages_read_engagement`."
>
> "E por fim: gerar o **token de acesso**. Esse token é como uma senha que permite o seu app postar na sua conta."
>
> "Um detalhe importante: o token expira a cada 60 dias. Então no nosso sistema eu criei um worker que renova automaticamente antes de expirar. Você nunca precisa fazer isso manualmente."

> **Nota de edição**: Essa parte pode ficar densa. Usar texto na tela resumindo os passos enquanto mostra o Meta Developer Portal. Speed up nas partes de configuração.

---

### 3B: O Fluxo de Publicação (43:00 — 48:00)

#### Script:

> "Agora a parte legal: como funciona a publicação por código."
>
> "O Instagram usa um sistema de 3 passos. Parece complicado, mas é simples:"
>
> "**Passo 1**: Criar um 'container'. É tipo dizer pro Instagram: 'ei, tô preparando um post com essa imagem e essa legenda'. Ele te devolve um ID."
>
> "**Passo 2**: Esperar o container ficar pronto. O Instagram processa a imagem do lado dele. A gente fica verificando: 'já ficou pronto? já ficou pronto?' até ele dizer 'FINISHED'."
>
> "**Passo 3**: Publicar. Com o container pronto, é só mandar: 'publica isso'. E pronto. Aparece no feed."

*[Mostra o código do instagram.service.ts]*

> "No código fica assim: três chamadas à API do Meta, com o token de acesso e o ID do usuário."
>
> "E a URL da imagem — que lembra? Tá no MinIO, com acesso público. O Instagram acessa essa URL, baixa a imagem e publica."

*[Faz o teste ao vivo — publica um post de verdade]*

> "Vou publicar ao vivo. Vou pegar aquele post que a gente criou antes..."
>
> *[Chama o endpoint /api/posts/:id/publish]*
>
> "Criando container... esperando... FINISHED... publicando..."
>
> *[Abre o Instagram no celular]*
>
> "E lá está. No meu feed. Publicado pelo meu app."

> **Nota de edição**: SEGUNDO MOMENTO CHAVE. Mostrar o post aparecendo no Instagram real. Split screen: terminal à esquerda, Instagram no celular à direita. Reação genuína.

---

### 3C: O Agendamento (48:00 — 50:00)

#### Script:

> "Mas ninguém quer publicar tudo na hora, né? A graça é **agendar**."
>
> "Pra isso eu uso o **BullMQ** — uma fila de tarefas que roda com Redis. Funciona assim:"
>
> "Quando você agenda um post pras 10h de amanhã, o sistema calcula: 'faltam X milissegundos'. E cria um job com esse delay."
>
> "Quando chega a hora, o worker acorda, pega o job e executa os 3 passos de publicação. Se der erro, ele tenta de novo. Até 3 vezes."
>
> "E ainda manda notificação no Telegram: 'Post publicado com sucesso' ou 'Falha ao publicar, vou tentar de novo'."

> **Dica de gravação**: Mostrar rapidamente o código do worker. Não precisa entrar em detalhes do BullMQ — só o conceito.

---

## BLOCO 4: O DASHBOARD — INTERFACE VISUAL (50:00 — 65:00)

### Transição:

> "O backend tá pronto. Funciona lindo. Mas... tá tudo no terminal. Ninguém quer gerenciar posts pelo terminal."
>
> "Hora de criar uma **interface bonita**."

---

### 4A: A Stack do Frontend (50:00 — 53:00)

#### Script:

> "Pro dashboard eu vou usar **Next.js** — que é o framework React mais popular do mundo — com **Tailwind CSS** pra estilização e **shadcn/ui** pra componentes prontos."
>
> "Se você nunca mexeu com isso: Next.js cuida da estrutura da aplicação, Tailwind deixa bonito, e shadcn/ui te dá botões, tabelas, inputs prontos e consistentes."
>
> "E o design vai ser **tema escuro**. Porque criador de conteúdo tech merece dark mode."

*[Mostra a paleta de cores]*

> "As cores: azul escuro pro background, rosa vibrante pros destaques, cinza pros textos. Clean e moderno."

---

### 4B: Construindo as Telas (53:00 — 63:00)

#### Script:

> "O dashboard tem 5 telas principais."

**Tela 1 — Dashboard Home (53:00 — 55:00)**

> "A home mostra um resumo de tudo: quantos posts estão agendados, quantos publicaram essa semana, e o próximo post na fila."
>
> "Aqui em baixo tem cards dos próximos 5 posts com thumbnail da imagem e countdown: 'publica em 3 horas'."

*[Mostra a tela sendo construída em tempo real]*

**Tela 2 — Criar Post (55:00 — 59:00)**

> "Essa é a tela principal. Aqui é onde a magia acontece."
>
> "Do lado esquerdo: o editor. Campo de legenda com contador de caracteres, campo de prompt pra IA, botão de gerar imagem e zona de upload drag & drop."
>
> "Do lado direito: um **mockup de post do Instagram em tempo real**. Conforme você edita, o preview atualiza. Você vê exatamente como vai ficar no feed antes de publicar."
>
> *[Demonstra: digita uma legenda e o preview atualiza]*
>
> "E aqui embaixo: seletor de data e hora pra agendamento. E três botões: Salvar Rascunho, Agendar, Publicar Agora."

*[Demonstra: clica em Gerar Imagem, espera, mostra o preview atualizando com a imagem gerada]*

> "Olha que satisfatório. Digitei o prompt, cliquei em gerar... e o preview atualizou com a imagem da IA. Isso aqui parece um produto real."

**Tela 3 — Lista de Posts (59:00 — 60:30)**

> "Aqui temos todos os posts num grid. Cada card mostra a thumbnail, o status com badge colorido — verde pra publicado, azul pra agendado, vermelho pra falhou — e ações rápidas."

**Tela 4 — Calendário (60:30 — 62:00)**

> "O calendário mostra a visão mensal. Cada dia tem bolinhas indicando os posts agendados. Clicou no dia, abre o detalhe."
>
> "Isso é ótimo pra planejamento: você bate o olho e sabe se tem buraco na semana."

**Tela 5 — Configurações (62:00 — 63:00)**

> "Aqui conecta tudo: o status da conexão com o Instagram, as API keys do Nano Banana, configuração do Telegram bot e preferências como tom padrão de legenda e hashtags fixas."

---

### 4C: Preview Final do Dashboard (63:00 — 65:00)

#### Script:

> "Vou dar um tour rápido no dashboard finalizado."

*[Navega pelas telas rapidamente, mostrando o fluxo completo: cria post → gera imagem → preview → agenda]*

> "Em menos de 1 minuto: criei um post, gerei a imagem com IA, ajustei a legenda, e agendei pras 10h de amanhã. Tudo visual, tudo intuitivo."

> **Nota de edição**: Esse tour precisa ser fluido e rápido. Música de fundo subindo. Sensação de "uau, tá pronto".

---

## BLOCO 5: BOT DO TELEGRAM — POSTANDO PELO CELULAR (65:00 — 78:00)

### Transição:

> "O dashboard é incrível. Mas sabe o que é mais prático? Tá deitado no sofá, ter uma ideia de post, pegar o celular e mandar pro bot: 'cria um post sobre isso pra amanhã'."
>
> "É isso que o bot do Telegram faz."

---

### 5A: Criando o Bot (65:00 — 69:00)

#### Script:

> "Criar um bot no Telegram é surpreendentemente fácil."
>
> *[Mostra o Telegram, abrindo conversa com @BotFather]*
>
> "Você fala com o BotFather — que é o bot oficial que cria outros bots — manda /newbot, escolhe um nome, e ele te dá um token."
>
> "Esse token é a identidade do seu bot. Com ele, seu código consegue receber e enviar mensagens."
>
> "No código, eu uso o **grammy.js** — uma biblioteca TypeScript pra bots de Telegram. Leve e poderosa."

*[Mostra o código do bot iniciando]*

> "A primeira coisa que o bot faz ao receber uma mensagem é verificar se o remetente está na **whitelist**. Eu não quero que qualquer pessoa do mundo consiga postar no meu Instagram, né?"

---

### 5B: Comandos e Fluxo Conversacional (69:00 — 75:00)

#### Script:

> "O bot tem dois modos: comandos e conversa natural."
>
> "Os comandos são diretos:"
>
> "Barra novopost — abre o fluxo interativo, te pergunta o tema, gera a imagem, te mostra preview."
>
> "Barra gerar seguido de uma descrição — gera tudo automaticamente e te manda o resultado."
>
> "Barra listar — mostra seus posts agendados."
>
> "Mas a parte mais legal é a **conversa natural**."

*[Demonstra no celular]*

> "Olha: eu vou mandar simplesmente 'faz um post sobre o novo modelo do Gemini'. Sem comando, sem barra, texto livre."
>
> *[Bot processa, gera imagem, envia preview]*
>
> "Ele entendeu que eu quero criar um post, extraiu o tema, chamou o Nano Banana pra gerar a imagem, criou a legenda... e me mandou um preview com três botões: Aprovar, Editar Legenda e Nova Imagem."
>
> *[Clica em Aprovar]*
>
> "Aprovei. Agora ele pergunta: 'Publicar agora ou agendar?'"
>
> *[Clica em Agendar]*
>
> "Selecionei agendar pra amanhã às 10h. Pronto. Do sofá. Em 30 segundos."

> **Nota de edição**: TUDO isso deve ser gravado na tela do celular real. O viewer precisa sentir que é fácil de usar. Pode usar espelhamento de tela ou gravar direto no celular.

---

### 5C: Notificações Automáticas (75:00 — 78:00)

#### Script:

> "E tem as notificações. Quando chega a hora e o post é publicado, o bot te avisa:"
>
> *[Mostra notificação: '✅ Post publicado com sucesso! Veja no Instagram: [link]']*
>
> "Se deu erro, ele também avisa: 'Falha ao publicar. Motivo: token expirado. Tentando de novo em 5 minutos.'"
>
> "Você nunca fica no escuro."

---

## BLOCO 6: DEPLOY NA VPS COM COOLIFY (78:00 — 90:00)

### Transição:

> "Tudo funciona perfeito no meu computador. Mas se eu desligar o PC, tudo para. Preciso colocar isso pra rodar 24 horas por dia, 7 dias por semana."
>
> "Pra isso vou usar uma **VPS** — um servidor virtual na nuvem — com o **Coolify** gerenciando tudo."

---

### 6A: O que é Coolify (78:00 — 81:00)

#### Script:

> "Coolify é tipo uma Vercel, só que **sua**. Open source, self-hosted, com mais de 35 mil estrelas no GitHub."
>
> "Ele gerencia seus containers Docker, configura SSL automático, faz deploy toda vez que você dá push no Git... Tudo com uma interface bonita."
>
> "E o custo? Uma VPS na Hetzner com 2 CPUs, 4GB de RAM e 80GB de disco sai por **7 euros por mês**. Menos de 40 reais. Pra rodar o sistema inteiro."

*[Mostra a página do Coolify]*

---

### 6B: Instalando na VPS (81:00 — 85:00)

#### Script:

> "A instalação é um único comando:"

*[Mostra o terminal SSH conectado na VPS]*

> "Conectei na VPS via SSH. Agora rodo o script de instalação do Coolify..."
>
> *[curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash]*
>
> "Em 2 minutos tá instalado. Abro no browser..."
>
> *[Mostra o painel do Coolify]*
>
> "Esse é o painel. Daqui eu gerencio tudo."

---

### 6C: Deployando o InstaPost AI (85:00 — 90:00)

#### Script:

> "Agora vou adicionar nosso projeto. Clico em 'New Resource', seleciono 'Docker Compose', aponto pro meu repositório Git..."
>
> *[Mostra as configurações no Coolify]*
>
> "Configuro os domínios:"
>
> "**app.instapost.com.br** pro dashboard."
> "**api.instapost.com.br** pro backend."
> "**s3.instapost.com.br** pro MinIO — que precisa ser público pras imagens."
>
> "Coloco as variáveis de ambiente — todas aquelas que a gente configurou antes..."
>
> "E clico em **Deploy**."
>
> *[Mostra os logs de build rodando]*
>
> "Tá buildando... instalando dependências... rodando migrations no banco..."
>
> *[Build completo]*
>
> "Deu verde. Todos os 7 containers rodando: API, Web, Bot, MCP, Postgres, Redis e MinIO."
>
> *[Abre app.instapost.com.br no browser]*
>
> "E olha lá: o dashboard acessível pelo domínio, com SSL. Na internet. Funcionando."

> **Nota de edição**: Acelerar o build (2-3 minutos reais, comprimir pra 30 segundos com timelapse). Momento de revelação quando o dashboard abre no domínio real.

---

## BLOCO 7: O RESULTADO FINAL FUNCIONANDO (90:00 — 95:00)

### Transição:

> "Vamos ver tudo junto? Do início ao fim?"

---

### Script:

> "Cenário 1: pelo **Dashboard**."
>
> *[Abre o dashboard, cria post, gera imagem, escreve legenda, agenda pra daqui 1 minuto]*
>
> "Criei, gerei, agendei. Agora vou esperar..."
>
> *[Post é publicado, mostra no Instagram]*
>
> "Publicou. Sozinho."

*[Pausa]*

> "Cenário 2: pelo **Telegram**."
>
> *[Pega o celular, abre Telegram, manda mensagem pro bot]*
>
> "Mandei: 'Cria um post sobre vibe coding com Claude Code'."
>
> *[Bot responde com preview]*
>
> "Aprovei, publiquei..."
>
> *[Mostra no Instagram]*
>
> "Dois posts no feed. Um criado pelo computador, outro pelo celular. Os dois com imagens geradas por IA."

*[Olha pra câmera]*

> "Isso é **automação de verdade**. Não é ferramenta de terceiro. Não é SaaS que cobra 50 dólares por mês. É um sistema SEU, rodando na SUA VPS, fazendo O QUE VOCÊ QUER."

> **Nota de edição**: Esse bloco é o clímax. Música subindo, cortes rápidos, demonstração fluida. É aqui que o viewer pensa "eu PRECISO fazer isso".

---

## FECHAMENTO (95:00 — ~100:00)

### Script:

> "E é isso. Em menos de 2 horas, a gente construiu do zero:"
>
> "Um backend completo com API REST."
> "Integração com IA que gera imagens profissionais."
> "Publicação automática no Instagram."
> "Um dashboard visual pra gerenciar tudo."
> "Um bot no Telegram pra criar posts pelo celular."
> "E tudo deployado na nuvem, rodando 24/7."

*[Pausa]*

> "Se você me perguntasse 2 anos atrás se um iniciante conseguia construir isso, eu diria que não. Mas com as ferramentas de hoje — Claude Code, vibe coding, APIs de IA que custam centavos — o jogo mudou."
>
> "Você não precisa ser um programador sênior. Você precisa ter a **ideia** e a **vontade** de construir."

---

### CTA Final:

> "Se esse vídeo te ajudou, deixa o like. De verdade, isso faz o YouTube mostrar pra mais gente."
>
> "Se inscreve no canal se você quer mais conteúdos assim — eu tô toda semana trazendo projetos reais com IA."
>
> "E nos comentários me diz: que tipo de app você quer que eu construa no próximo vídeo?"
>
> "Todo o código tá no link da descrição. É só clonar e seguir o passo a passo."
>
> "Valeu demais por ficar até aqui. A gente se vê no próximo."

*[Acena, tela escurece]*

> **Nota de edição**: Tela final com card do próximo vídeo + botão de inscrição animado. 5 segundos.

---

## NOTAS DE PRODUÇÃO

### Materiais para a Descrição:

- Link do repositório GitHub
- Link do ARCHITECTURE.md e PROMPT.md
- Links das documentações:
  - Instagram Graph API: https://developers.facebook.com/docs/instagram-platform/content-publishing/
  - Nano Banana: https://ai.google.dev/gemini-api/docs/image-generation
  - Coolify: https://coolify.io/docs/get-started/installation
  - MinIO: https://min.io/docs
  - grammy.js: https://grammy.dev
  - Prisma: https://www.prisma.io/docs
  - BullMQ: https://docs.bullmq.io

### Sugestões de Edição:

- **Música de fundo**: Lo-fi instrumental leve durante código, algo mais energético nas demos
- **Efeitos sonoros**: Notificação quando o post publica, "ding" quando algo funciona
- **B-roll sugerido**: Tela do Instagram scrollando, mãos digitando no celular, servidor rodando
- **Zoom**: Sempre que mostrar código importante, dar zoom na linha relevante
- **Texto na tela**: Nos momentos de configuração (Meta Developer, Coolify), colocar bullets resumindo os passos
- **Speed up**: Build do Docker (comprimir 2-3 min pra 30s), instalações npm, migrations
- **Capítulos do YouTube**: Usar os timestamps da estrutura geral como capítulos

### Thumbnail Detalhada:

- Fundo: gradiente escuro (#0A0A0A → #1A1A2E)
- Esquerda: recorte de tela com código (ligeiramente desfocado)
- Centro: mockup de post Instagram com imagem bonita gerada por IA
- Direita: sua foto (expressão de "olha isso")
- Texto overlay: "POSTA SOZINHO" em amarelo bold
- Ícones pequenos: logo Telegram + Instagram + IA
- Estilo: alto contraste, profissional mas chamativo

### Checklist Pré-Gravação:

- [ ] Conta Instagram Business configurada
- [ ] App no Meta Developer Portal criado e aprovado
- [ ] Token de acesso do Instagram gerado
- [ ] API key do Nano Banana ativa
- [ ] Bot do Telegram criado via BotFather
- [ ] VPS contratada e Coolify instalado
- [ ] Domínios configurados (app, api, s3)
- [ ] Repositório Git com código completo pronto
- [ ] Ambiente de desenvolvimento limpo (sem abas desnecessárias)
- [ ] Testar TUDO uma vez antes de gravar (nada pior que erro ao vivo que quebra o fluxo)
