# InstaPost AI - Prompt de Projeto para Claude Code

## Master Prompt

Você é um desenvolvedor full-stack senior especializado em Node.js, React/Next.js, TypeScript e integrações de API. Você vai construir o **InstaPost AI**, um sistema inteligente de criação e agendamento de posts para Instagram.

### Descrição do Projeto

Uma plataforma que integra geração de imagens por IA (Nano Banana/Gemini API), criação automática de legendas, agendamento de publicações e múltiplos pontos de entrada (Dashboard Web, Telegram Bot e Cowork via MCP). O sistema roda em uma **VPS com Coolify**, usando **PostgreSQL** para banco de dados e **MinIO** para armazenamento de imagens.

### Stack Obrigatória

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** Next.js 14 + Tailwind CSS + shadcn/ui
- **Banco de Dados:** PostgreSQL 16 + Prisma ORM
- **Fila:** BullMQ + Redis 7
- **Storage:** MinIO (self-hosted, compatível S3)
- **Telegram Bot:** grammy.js
- **MCP Server:** TypeScript SDK (@modelcontextprotocol/sdk)
- **Deploy:** Docker Compose + Coolify (VPS)
- **Validação:** Zod em todos os endpoints
- **Auth:** JWT com refresh tokens

### Regras de Desenvolvimento

1. Use TypeScript strict em todo o projeto
2. Siga padrões REST para a API
3. Implemente validação com Zod em todos os endpoints
4. Use variáveis de ambiente para todas as credenciais (nunca hardcode)
5. Implemente error handling robusto com logs estruturados (pino)
6. Documente cada endpoint com JSDoc
7. Escreva testes para lógica crítica (agendamento, publicação, geração)
8. Use migrations do Prisma para o banco de dados
9. Todos os containers devem ter health checks
10. Use `@aws-sdk/client-s3` ou `minio` npm para interagir com o MinIO

### Estrutura do Monorepo

```
instapost-ai/
├── packages/
│   ├── api/                 # Backend Express + TypeScript
│   ├── web/                 # Frontend Next.js 14
│   ├── bot/                 # Telegram Bot (grammy.js)
│   ├── mcp/                 # MCP Server para Cowork
│   └── shared/              # Tipos e utils compartilhados
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── package.json             # Workspaces
└── turbo.json               # Turborepo config
```

---

## Prompts por Componente

### Prompt 1: Setup Inicial do Projeto

```
Crie o setup inicial do monorepo InstaPost AI:

1. Inicialize com npm workspaces e Turborepo
2. Configure TypeScript strict em todos os packages
3. Configure ESLint + Prettier compartilhado
4. Crie o package shared com tipos comuns (PostStatus, ImageSource, PostSource, etc.)
5. Crie .env.example com todas as variáveis necessárias
6. Crie docker-compose.yml com: postgres:16-alpine, redis:7-alpine, minio/minio:latest
7. Crie docker-compose.dev.yml que extends o principal com volumes para hot reload

Infraestrutura:
- PostgreSQL na porta 5432 com volume persistente
- Redis na porta 6379 com volume persistente
- MinIO nas portas 9000 (API S3) e 9001 (Console) com volume persistente
- MinIO deve ter MINIO_ROOT_USER e MINIO_ROOT_PASSWORD configuráveis via .env
```

### Prompt 2: Backend API

```
Crie o backend do InstaPost AI em packages/api/:

ESTRUTURA:
src/
├── config/
│   ├── database.ts          # Prisma client singleton
│   ├── redis.ts             # Conexão Redis (ioredis)
│   ├── minio.ts             # Cliente MinIO com inicialização de bucket
│   └── env.ts               # Validação com Zod (todas as env vars tipadas)
├── controllers/
│   ├── post.controller.ts   # CRUD completo de posts
│   ├── generate.controller.ts # Geração de imagem e legenda
│   ├── upload.controller.ts  # Upload manual de imagens
│   └── auth.controller.ts   # Login, registro, refresh token
├── services/
│   ├── instagram.service.ts  # Publicação via Graph API (3 steps: create container → poll → publish)
│   ├── nanobana.service.ts   # Geração de imagens via Nano Banana API
│   ├── caption.service.ts    # Geração de legendas (pode usar Gemini ou template)
│   ├── scheduler.service.ts  # Criação de jobs BullMQ com delay calculado
│   └── storage.service.ts    # Upload/download/delete no MinIO
├── routes/                   # Todas as rotas organizadas por recurso
├── middleware/
│   ├── auth.middleware.ts    # JWT verification
│   ├── rateLimiter.ts       # express-rate-limit
│   └── validate.ts          # Middleware genérico de validação Zod
├── jobs/
│   ├── publish.worker.ts    # Worker: publica post no Instagram
│   └── token-refresh.worker.ts # Worker: renova token Instagram a cada 50 dias
├── prisma/
│   └── schema.prisma        # Schema completo (ver ARCHITECTURE.md)
├── types/
│   └── index.ts
└── index.ts

ENDPOINTS:
POST   /api/posts              - Criar post
GET    /api/posts              - Listar posts (filtros: status, source, dateRange)
GET    /api/posts/:id          - Detalhe do post
PUT    /api/posts/:id          - Atualizar post
DELETE /api/posts/:id          - Remover post
POST   /api/posts/:id/publish  - Publicar agora
POST   /api/posts/:id/schedule - Agendar
POST   /api/generate/image     - Gerar imagem (Nano Banana)
POST   /api/generate/caption   - Gerar legenda
POST   /api/upload             - Upload de imagem (multer → MinIO)
POST   /api/auth/login         - Login (retorna JWT)
POST   /api/auth/register      - Registro
POST   /api/auth/refresh       - Refresh token
GET    /api/instagram/status   - Status da conexão

IMPORTANTE:
- MinIO é o storage de imagens. Use o pacote 'minio' do npm.
- Ao iniciar o server, chame initMinio() para criar o bucket 'instapost-images' com policy public-read
- As URLs das imagens seguem o formato: {MINIO_PUBLIC_URL}/instapost-images/{key}
- A Instagram Graph API precisa de URLs públicas, por isso o MinIO deve ser exposto via Traefik/Coolify
```

### Prompt 3: Integração Nano Banana

```
Implemente o serviço de geração de imagens em packages/api/src/services/nanobana.service.ts:

REQUISITOS:
- Suportar múltiplos providers via env NANO_BANANA_PROVIDER:
  - "google": Google AI Studio (Gemini 2.5 Flash) - endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview:generateContent
  - "nanobananaapi": NanoBananaAPI.ai - endpoint: https://api.nanobananaapi.ai/v1/generate
  - "fal": fal.ai - endpoint: https://fal.run/fal-ai/nano-banana-2
- Resolução padrão: 1080x1080 (formato Instagram square)
- Suportar formatos: 1:1 (feed), 9:16 (stories/reels), 4:5 (portrait)
- Enriquecer prompts com: "Professional social media post, high quality, vibrant colors, modern design, {user_prompt}"
- Salvar imagem gerada no MinIO e retornar URL pública
- Retry com backoff exponencial (3 tentativas, base 2s)
- Timeout de 30 segundos por chamada
- Validar resposta (tamanho mínimo do buffer, content-type)
```

### Prompt 4: Telegram Bot

```
Crie o bot do Telegram em packages/bot/:

TECH: grammy.js + TypeScript

COMANDOS:
/start - Boas-vindas com menu de opções
/novopost - Fluxo interativo (pergunta tema → gera imagem → gera legenda → preview → aprovação)
/gerar [texto] - Geração rápida: gera imagem + legenda automaticamente, envia preview
/agendar [id] [YYYY-MM-DD HH:mm] - Agenda post existente
/listar - Lista próximos 10 posts agendados com status
/publicar [id] - Publica imediatamente
/cancelar [id] - Cancela agendamento
/status - Mostra: conexão Instagram OK/FAIL, posts agendados, próximo post

FLUXO CONVERSACIONAL:
- Se o usuário envia texto livre (não é comando), interpretar como pedido de criação
- Extrair tema da mensagem
- Chamar POST /api/generate/image e POST /api/generate/caption no backend
- Enviar imagem como foto + legenda como texto
- Botões inline: [✅ Aprovar] [✏️ Editar Legenda] [🔄 Nova Imagem] [❌ Cancelar]
- Após aprovar: perguntar "Publicar agora ou agendar?" com botões inline

SEGURANÇA:
- Middleware que verifica chat_id contra TELEGRAM_ALLOWED_CHAT_IDS
- Responder "Acesso não autorizado" para IDs não na whitelist
- Log de todas as ações com timestamp e chat_id

O bot se comunica com o backend via HTTP (packages/api endpoints).
```

### Prompt 5: MCP Server

```
Crie o servidor MCP em packages/mcp/ usando @modelcontextprotocol/sdk:

TOOLS A IMPLEMENTAR:

1. create_post
   Input: { caption?: string, image_prompt?: string, scheduled_at?: string, hashtags?: string[], tone?: string }
   Action: Se image_prompt fornecido → chama /api/generate/image. Se caption não fornecido → chama /api/generate/caption. Cria post via POST /api/posts.
   Output: { post_id, caption, image_url, status }

2. generate_image
   Input: { prompt: string, style?: string, aspect_ratio?: "1:1" | "9:16" | "4:5" }
   Action: POST /api/generate/image
   Output: { image_url }

3. generate_caption
   Input: { topic: string, tone?: "educativo" | "inspirador" | "humor" | "notícia", hashtags_count?: number, language?: string, max_length?: number }
   Action: POST /api/generate/caption
   Output: { caption, hashtags }

4. schedule_post
   Input: { post_id: string, datetime: string }
   Action: POST /api/posts/:id/schedule
   Output: { scheduled_at, status }

5. list_posts
   Input: { status?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED", limit?: number, offset?: number }
   Action: GET /api/posts?status=...&limit=...
   Output: { posts: [...], total }

6. publish_now
   Input: { post_id: string }
   Action: POST /api/posts/:id/publish
   Output: { instagram_id, published_at }

7. upload_image
   Input: { image_base64: string, filename: string }
   Action: POST /api/upload (converte base64 para buffer)
   Output: { image_url }

8. get_analytics
   Input: { period?: "7d" | "30d" | "90d" }
   Action: GET /api/analytics?period=...
   Output: { total_posts, published, engagement_avg }

AUTH: Usar Bearer token via header (MCP_AUTH_TOKEN)
TRANSPORT: stdio (para uso local com Cowork) ou HTTP (para uso remoto)
```

### Prompt 6: Dashboard Web (Next.js)

```
Crie o dashboard web em packages/web/ com Next.js 14 (App Router) + Tailwind + shadcn/ui:

DESIGN:
- Tema escuro como padrão
- Cores: primary=#0F3460, accent=#E94560, background=#0A0A0A, surface=#1A1A2E
- Componentes shadcn/ui para consistência
- Totalmente responsivo (mobile-first)
- Sidebar fixa com navegação

PÁGINAS:

/ (Dashboard)
- Cards de métricas: posts agendados, publicados hoje/semana, taxa sucesso
- Lista dos próximos 5 posts com thumbnail e countdown
- Botão "Novo Post" destacado (accent color)
- Mini calendário do mês atual com dots nos dias com posts

/posts/new (Criar Post)
- Layout split: editor (esquerda) + preview Instagram mockup (direita)
- Campo de legenda com contador de caracteres (max 2200)
- Área de geração: input de prompt + botão "Gerar Imagem" + loading spinner
- Upload manual: zona drag & drop com preview
- Campo de hashtags com autocomplete
- Seletor de data/hora (date-fns + shadcn DatePicker)
- Botões: [Salvar Rascunho] [Agendar] [Publicar Agora]
- Preview deve parecer um post real do Instagram (avatar, nome, imagem, legenda)

/posts (Lista de Posts)
- Tabela com colunas: thumbnail, legenda (truncada), status (badge colorido), fonte, data
- Filtros: status, fonte (web/telegram/mcp), range de datas
- Ações por post: editar, duplicar, deletar, publicar
- Paginação

/calendar (Calendário)
- Visão mensal com cards dos posts agendados em cada dia
- Cores por status: azul=agendado, verde=publicado, vermelho=falhou
- Click no dia abre modal com detalhes

/settings (Configurações)
- Conexão Instagram: status + botão reconectar
- API Keys: Nano Banana (mostrar/esconder), provider selector
- Telegram: bot token, chat IDs autorizados
- Preferências: tom padrão, hashtags fixas, horários favoritos

API CLIENT:
- Usar fetch wrapper com baseURL de NEXT_PUBLIC_API_URL
- Interceptor para adicionar JWT em todas as requests
- Refresh automático de token quando 401
```

### Prompt 7: Skill do Cowork (SKILL.md)

```
Crie o arquivo SKILL.md para a skill de criação de posts do InstaPost AI:

---
description: "Criador inteligente de posts para Instagram via InstaPost AI. Gera imagens com Nano Banana, cria legendas otimizadas e agenda publicações. Use quando o usuário mencionar: criar post, postar no instagram, agendar post, gerar imagem para post, conteúdo instagram, post de IA, publicar no insta."
---

# Criador de Posts InstaPost AI

Você é um especialista em criação de conteúdo para Instagram, focado no nicho de tecnologia, IA, programação e vibe coding. Você tem acesso às tools do MCP InstaPost AI.

## Ao receber um pedido de criação de post:

1. ANALISE o tema e identifique:
   - Público-alvo (devs, entusiastas tech, iniciantes)
   - Tom ideal (educativo, inspirador, humor, notícia)
   - Formato ideal (imagem única, carrossel, quote)

2. GERE A IMAGEM usando a tool `generate_image`:
   - Crie um prompt detalhado para o Nano Banana
   - Estilo: moderno, clean, cores vibrantes, profissional
   - Inclua texto legível se necessário
   - Formato: 1:1 para feed, 9:16 para stories

3. CRIE A LEGENDA usando a tool `generate_caption`:
   - Gancho forte na primeira linha (hook que para o scroll)
   - Conteúdo de valor no corpo (dica, insight, reflexão)
   - CTA no final (pergunta, convite para salvar/compartilhar)
   - 5-15 hashtags relevantes e estratégicas
   - Emojis com moderação (2-4 por post)

4. CRIE O POST usando a tool `create_post`:
   - Combine imagem + legenda + hashtags
   - Se horário especificado → status scheduled
   - Se não → status draft (para revisão)

## Diretrizes de Conteúdo

- Linguagem: Português BR, informal mas profissional
- Evite clickbait vazio, entregue valor real
- Referências: Claude, Cowork, Cursor, v0, Bolt, Lovable, Gemini
- Temas fortes: IA generativa, automação, produtividade, vibe coding, no-code
- Melhores horários: 8h-10h, 12h-13h, 18h-20h (BRT)
- Formato de hashtags: mix de alto volume (#IA, #Tech) + nicho (#VibeCoding, #ClaudeAI)

## Para criação em lote:

Quando o usuário pedir múltiplos posts:
1. Distribua os temas para variedade
2. Alterne os tons (educativo → inspirador → humor)
3. Agende em horários diferentes ao longo da semana
4. Garanta que cada post tem imagem e legenda únicos
```

### Prompt 8: Docker + Deploy Coolify

```
Configure o deploy completo em Docker Compose para rodar no Coolify:

CONTAINERS:
1. api (Node.js) - porta 3001 - depends: postgres, redis, minio
2. web (Next.js) - porta 3000 - depends: api
3. telegram-bot (Node.js) - processo contínuo - depends: api
4. mcp-server (Node.js) - porta 3002 - depends: api
5. postgres (16-alpine) - porta 5432 - volume: pgdata
6. redis (7-alpine) - porta 6379 - volume: redisdata
7. minio (minio/minio:latest) - portas 9000+9001 - volume: miniodata

DOCKERFILES:
- Multi-stage build para cada app Node.js (build → production)
- Usar node:20-alpine como base
- npm ci --only=production no stage final
- Health checks em todos os containers de app

COOLIFY:
- Domínios via Traefik:
  - app.instapost.com.br → web:3000
  - api.instapost.com.br → api:3001
  - s3.instapost.com.br → minio:9000 (para URLs públicas de imagem)
- SSL automático via Let's Encrypt
- Variáveis de ambiente configuradas no painel Coolify
- Deploy automático via webhook Git (push na main → deploy)

MINIO SETUP:
- Bucket 'instapost-images' criado automaticamente ao iniciar o API
- Policy public-read no bucket (Instagram API precisa acessar as imagens)
- Console admin na porta 9001 (acesso interno apenas)
- API S3 na porta 9000 (exposta via s3.instapost.com.br)
```

---

## Checklist de Implementação

### Fase 1: MVP (2-3 semanas)

| # | Tarefa | Prioridade |
|---|--------|-----------|
| 1 | Setup monorepo (Turborepo, TypeScript, ESLint, Prettier) | Alta |
| 2 | Docker Compose com Postgres + Redis + MinIO | Alta |
| 3 | Prisma schema + migrations | Alta |
| 4 | Backend: CRUD de posts (endpoints REST) | Alta |
| 5 | Serviço MinIO: upload, download, delete de imagens | Alta |
| 6 | Integração Nano Banana: geração de imagens | Alta |
| 7 | Instagram: publicação via Graph API (3-step flow) | Alta |
| 8 | Agendamento: BullMQ workers + scheduler | Alta |
| 9 | Frontend: Dashboard básico (criar, listar, agendar) | Alta |
| 10 | Auth: JWT + login + refresh token | Média |
| 11 | Deploy inicial no Coolify | Alta |

### Fase 2: Telegram + MCP (1-2 semanas)

| # | Tarefa | Prioridade |
|---|--------|-----------|
| 12 | Telegram Bot: comandos básicos | Alta |
| 13 | Telegram Bot: fluxo conversacional + botões inline | Média |
| 14 | MCP Server: todas as 8 tools | Alta |
| 15 | Skill Cowork: SKILL.md para criação de posts | Alta |
| 16 | Notificações Telegram (post publicado, falha, etc.) | Média |

### Fase 3: Polish (1 semana)

| # | Tarefa | Prioridade |
|---|--------|-----------|
| 17 | Analytics e métricas de engajamento | Média |
| 18 | Calendário visual com drag & drop | Média |
| 19 | Sugestão automática de melhores horários | Baixa |
| 20 | Upload em lote de imagens | Média |
| 21 | Suporte a carrossel (múltiplas imagens) | Média |
| 22 | Suporte a Reels (vídeo) | Baixa |
| 23 | Testes automatizados (Jest + Supertest) | Média |
| 24 | Monitoramento e alertas (uptime, erros) | Média |

---

## Como Usar Este Documento no Claude Code

1. Coloque `ARCHITECTURE.md` e `PROMPT.md` na raiz do projeto
2. No Claude Code, referencie: "Leia ARCHITECTURE.md e PROMPT.md para contexto"
3. Use os prompts por componente para pedir implementação fase a fase
4. Comece pelo Prompt 1 (Setup) e siga em ordem

Exemplo de uso:
```
Leia ARCHITECTURE.md e PROMPT.md. Agora implemente o Prompt 2 (Backend API) completo, seguindo todas as especificações.
```
