# InstaPost AI - Documento de Arquitetura

## 1. Visão Geral

O **InstaPost AI** é uma plataforma completa para criação, agendamento e publicação automática de posts no Instagram. Integra geração de imagens por IA (Nano Banana/Gemini), criação inteligente de textos via Claude/Cowork Skills, um bot do Telegram para controle remoto e um dashboard web para gestão visual.

### 1.1 Objetivos

- Automatizar o fluxo completo de criação e publicação de posts no Instagram
- Integrar geração de imagens por IA via Nano Banana API (Gemini)
- Permitir criação de posts via Telegram Bot, Dashboard Web e Cowork (MCP)
- Agendar publicações com horários otimizados
- Suportar upload manual de imagens pelo usuário
- Rodar em VPS própria com Coolify, PostgreSQL e MinIO

### 1.2 Pontos de Entrada

| Canal | Descrição | Caso de Uso |
|-------|-----------|-------------|
| Dashboard Web | Interface visual completa para gerenciar posts, agendar e fazer upload | Gestão diária, planejamento de conteúdo, revisão visual |
| Telegram Bot | Criação rápida de posts via mensagem de texto ou comando | Criar posts pelo celular, ideias rápidas, aprovação remota |
| Cowork via MCP | Integração direta com Claude para usar Skills na criação | Criação em lote, automação avançada, uso de Skills especializadas |

---

## 2. Arquitetura do Sistema

A arquitetura segue o padrão de microsserviços com um backend central que orquestra todas as operações. Cada componente é independente e se comunica via API REST. Tudo roda em uma **VPS com Coolify** para orquestração dos containers.

### 2.1 Diagrama de Componentes

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Telegram    │     │   Cowork     │     │   Dashboard     │
│  Bot         │     │   via MCP    │     │   Web (Next.js) │
└──────┬──────┘     └──────┬───────┘     └───────┬─────────┘
       │                   │                     │
       └───────────┬───────┴─────────────────────┘
                   ▼
          ┌────────────────┐
          │   Backend API  │
          │  (Node/Express)│
          ├────────────────┤
          │ • CRUD Posts   │
          │ • Agendamento  │
          │ • Auth JWT     │
          └──┬────┬────┬───┘
             │    │    │
    ┌────────▼┐ ┌─▼────▼──────┐  ┌──────────┐
    │  Nano   │ │ Instagram   │  │ MinIO    │
    │  Banana │ │ Graph API   │  │ (S3)     │
    │  API    │ │             │  │          │
    └─────────┘ └─────────────┘  └──────────┘
             │         │              │
          ┌──▼─────────▼──────────────▼──┐
          │        PostgreSQL            │
          │        (Prisma ORM)          │
          └──────────────────────────────┘
```

### 2.2 Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | Next.js 14 + Tailwind CSS + shadcn/ui | SSR, rotas API integradas, UI moderna e responsiva |
| Backend API | Node.js + Express + TypeScript | Ecossistema rico, async nativo, fácil integração com APIs |
| Banco de Dados | **PostgreSQL** (via Coolify) + Prisma ORM | Robusto, suporte a JSON, ótimo para agendamento |
| Fila de Jobs | BullMQ + Redis | Agendamento confiável, retry automático, dashboard |
| Storage de Imagens | **MinIO** (self-hosted, compatível S3) | Gratuito, self-hosted, API idêntica ao S3 |
| MCP Server | TypeScript (SDK MCP) | Protocolo padrão para integração com Cowork |
| Telegram Bot | grammy.js | Leve, TypeScript nativo, middleware robusto |
| Orquestração | **Coolify** (na VPS) | Deploy automático, SSL, gerenciamento de containers |
| Reverse Proxy | Traefik (via Coolify) | SSL automático, roteamento por domínio |

### 2.3 Infraestrutura (VPS + Coolify)

```
VPS (Ubuntu 22.04+)
├── Coolify (orquestrador)
│   ├── instapost-api        (container Node.js - porta 3001)
│   ├── instapost-web        (container Next.js - porta 3000)
│   ├── instapost-bot        (container Node.js - processo contínuo)
│   ├── instapost-mcp        (container Node.js - porta 3002)
│   ├── postgres             (container PostgreSQL 16 - porta 5432)
│   ├── redis                (container Redis 7 - porta 6379)
│   └── minio                (container MinIO - portas 9000/9001)
└── Traefik (reverse proxy - gerenciado pelo Coolify)
    ├── app.instapost.com.br    → instapost-web:3000
    ├── api.instapost.com.br    → instapost-api:3001
    └── s3.instapost.com.br     → minio:9000
```

**Configuração MinIO:**
- Console de admin: porta 9001 (acesso interno)
- API S3: porta 9000 (exposta via Traefik para URLs públicas de imagem)
- Bucket principal: `instapost-images`
- Policy do bucket: `public-read` (imagens precisam ser acessíveis publicamente para a Instagram API)
- Retenção: sem expiração (manter histórico de imagens)

**Requisitos mínimos da VPS:**
- 2 vCPU, 4GB RAM, 80GB SSD
- Ubuntu 22.04 LTS
- Providers recomendados: Hetzner (€7/mês), Contabo, DigitalOcean

---

## 3. Componentes Detalhados

### 3.1 Backend API (Core)

O backend é o núcleo do sistema. Recebe requisições de qualquer ponto de entrada, orquestra a geração de conteúdo, armazena dados e publica no Instagram.

**Estrutura de pastas:**

```
instapost-api/
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma client
│   │   ├── redis.ts             # Conexão Redis
│   │   ├── minio.ts             # Cliente MinIO (S3)
│   │   └── env.ts               # Validação de env vars com Zod
│   ├── controllers/
│   │   ├── post.controller.ts
│   │   ├── generate.controller.ts
│   │   ├── upload.controller.ts
│   │   └── auth.controller.ts
│   ├── services/
│   │   ├── instagram.service.ts  # Publicação via Graph API
│   │   ├── nanobana.service.ts   # Geração de imagens
│   │   ├── caption.service.ts    # Geração de legendas
│   │   ├── scheduler.service.ts  # Agendamento com BullMQ
│   │   └── storage.service.ts    # Upload/download MinIO
│   ├── routes/
│   │   ├── post.routes.ts
│   │   ├── generate.routes.ts
│   │   ├── upload.routes.ts
│   │   └── auth.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT validation
│   │   ├── rateLimiter.ts        # Rate limiting
│   │   └── validate.ts           # Zod validation
│   ├── jobs/
│   │   ├── publish.worker.ts     # Worker de publicação
│   │   └── token-refresh.worker.ts # Refresh do token Instagram
│   ├── prisma/
│   │   └── schema.prisma
│   ├── types/
│   │   └── index.ts
│   └── index.ts                  # Entry point
├── .env.example
├── Dockerfile
├── package.json
└── tsconfig.json
```

**Endpoints da API:**

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/posts` | Criar novo post (rascunho ou agendado) |
| GET | `/api/posts` | Listar todos os posts (filtros: status, data, source) |
| GET | `/api/posts/:id` | Detalhes de um post específico |
| PUT | `/api/posts/:id` | Atualizar post (legenda, imagem, horário) |
| DELETE | `/api/posts/:id` | Remover post |
| POST | `/api/posts/:id/publish` | Publicar imediatamente |
| POST | `/api/posts/:id/schedule` | Agendar publicação |
| POST | `/api/generate/image` | Gerar imagem via Nano Banana |
| POST | `/api/generate/caption` | Gerar legenda via IA |
| POST | `/api/upload` | Upload manual de imagem → MinIO |
| GET | `/api/analytics` | Métricas dos posts publicados |
| POST | `/api/auth/login` | Autenticação do usuário |
| GET | `/api/instagram/status` | Status da conexão com Instagram |

### 3.2 Modelo de Dados (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id            String      @id @default(uuid())
  caption       String?
  imageUrl      String?
  imageSource   ImageSource @default(NANOBANA)
  nanoPrompt    String?
  status        PostStatus  @default(DRAFT)
  scheduledAt   DateTime?
  publishedAt   DateTime?
  instagramId   String?
  source        PostSource  @default(WEB)
  hashtags      String[]
  aspectRatio   String      @default("1:1")
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([status])
  @@index([scheduledAt])
  @@index([userId])
}

model InstagramToken {
  id           String   @id @default(uuid())
  accessToken  String
  expiresAt    DateTime
  refreshedAt  DateTime @default(now())
  userId       String   @unique
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHING
  PUBLISHED
  FAILED
}

enum ImageSource {
  NANOBANA
  UPLOAD
  URL
}

enum PostSource {
  WEB
  TELEGRAM
  MCP
}
```

### 3.3 Integração Nano Banana API

O Nano Banana (API de geração de imagens do Gemini) cria as imagens dos posts. O sistema suporta múltiplos providers.

**Providers suportados:**

| Provider | Modelo | Preço Aprox. | Melhor Para |
|----------|--------|-------------|-------------|
| Google AI Studio | Gemini 2.5 Flash | Gratuito (limite) | Testes e baixo volume |
| NanoBananaAPI.ai | Nano Banana 2 | ~$0.02/img | Produção, melhor custo |
| fal.ai | Nano Banana 2 | ~$0.04/img | Alta qualidade, 4K |
| PiAPI | Nano Banana Pro | ~$0.10/img | Texto perfeito em imagens |

**Fluxo de geração:**

1. Usuário envia prompt descrevendo a imagem desejada
2. Backend enriquece o prompt com contexto do nicho/marca
3. Chamada à API do Nano Banana com parâmetros (resolução 1080x1080, estilo)
4. Imagem gerada é salva no **MinIO** (bucket `instapost-images`)
5. URL pública da imagem é associada ao post (via `s3.instapost.com.br/{key}`)

**Implementação do serviço:**

```typescript
// src/services/nanobana.service.ts
import { minioClient } from '../config/minio';

interface GenerateImageParams {
  prompt: string;
  style?: string;
  aspectRatio?: '1:1' | '9:16' | '4:5';
}

interface GenerateImageResult {
  imageUrl: string;
  minioKey: string;
}

export async function generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
  const enrichedPrompt = enrichPrompt(params.prompt, params.style);

  // Chamar Nano Banana API
  const response = await fetch(process.env.NANO_BANANA_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NANO_BANANA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: enrichedPrompt,
      aspect_ratio: params.aspectRatio || '1:1',
      output_format: 'png',
    }),
  });

  const imageBuffer = await response.arrayBuffer();

  // Upload para MinIO
  const key = `posts/${Date.now()}-${randomId()}.png`;
  await minioClient.putObject('instapost-images', key, Buffer.from(imageBuffer), {
    'Content-Type': 'image/png',
  });

  const imageUrl = `${process.env.MINIO_PUBLIC_URL}/${key}`;
  return { imageUrl, minioKey: key };
}
```

### 3.4 Storage com MinIO

MinIO é um object storage self-hosted 100% compatível com a API S3. Roda como container no Coolify.

**Configuração do cliente:**

```typescript
// src/config/minio.ts
import * as Minio from 'minio';

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

// Inicialização: criar bucket se não existir
export async function initMinio() {
  const bucketExists = await minioClient.bucketExists('instapost-images');
  if (!bucketExists) {
    await minioClient.makeBucket('instapost-images');
    // Policy pública para leitura (Instagram API precisa acessar as imagens)
    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: ['arn:aws:s3:::instapost-images/*'],
      }],
    };
    await minioClient.setBucketPolicy('instapost-images', JSON.stringify(policy));
  }
}
```

**Serviço de upload:**

```typescript
// src/services/storage.service.ts
import { minioClient } from '../config/minio';
import { randomUUID } from 'crypto';

export async function uploadImage(buffer: Buffer, mimetype: string): Promise<string> {
  const ext = mimetype === 'image/png' ? 'png' : 'jpg';
  const key = `uploads/${randomUUID()}.${ext}`;

  await minioClient.putObject('instapost-images', key, buffer, {
    'Content-Type': mimetype,
  });

  return `${process.env.MINIO_PUBLIC_URL}/instapost-images/${key}`;
}

export async function deleteImage(key: string): Promise<void> {
  await minioClient.removeObject('instapost-images', key);
}
```

### 3.5 Instagram Graph API

Publicação via API oficial do Meta. Requer conta Business/Creator conectada a uma Página do Facebook.

**Fluxo de publicação:**

```typescript
// src/services/instagram.service.ts

// Step 1: Criar container de mídia
const createContainer = await fetch(
  `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`, {
    method: 'POST',
    body: new URLSearchParams({
      image_url: post.imageUrl,  // URL pública do MinIO
      caption: `${post.caption}\n\n${post.hashtags.map(h => `#${h}`).join(' ')}`,
      access_token: INSTAGRAM_ACCESS_TOKEN,
    }),
  }
);
const { id: containerId } = await createContainer.json();

// Step 2: Polling até status FINISHED
let status = 'IN_PROGRESS';
while (status !== 'FINISHED') {
  await sleep(3000);
  const check = await fetch(
    `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${token}`
  );
  status = (await check.json()).status_code;
}

// Step 3: Publicar
const publish = await fetch(
  `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({
      creation_id: containerId,
      access_token: INSTAGRAM_ACCESS_TOKEN,
    }),
  }
);
```

**Requisitos:**
- Conta Instagram Business ou Creator
- Página do Facebook vinculada
- App registrado no Meta Developer Portal
- Token com permissões: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
- Imagens em URL pública acessível (MinIO com policy public-read)
- Token refresh automático a cada 60 dias

### 3.6 Telegram Bot

Bot para criar e gerenciar posts diretamente pelo celular via grammy.js.

**Comandos:**

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/start` | Boas-vindas e instruções | `/start` |
| `/novopost` | Inicia criação interativa | `/novopost` |
| `/gerar` | Gera imagem + legenda automática | `/gerar post sobre IA generativa` |
| `/agendar` | Agenda post para data/hora | `/agendar 2026-03-20 10:00` |
| `/listar` | Lista posts agendados | `/listar` |
| `/publicar` | Publica imediatamente | `/publicar #id` |
| `/cancelar` | Cancela agendamento | `/cancelar #id` |
| `/status` | Status conexão Instagram | `/status` |

**Fluxo conversacional:**

1. Usuário: "Cria um post sobre as novidades do Claude 4"
2. Bot analisa a intenção e extrai: tema = "novidades Claude 4"
3. Backend gera imagem via Nano Banana e legenda via Skill
4. Bot envia preview (imagem + legenda) para aprovação
5. Usuário aprova, edita ou rejeita via botões inline
6. Após aprovação, o post é agendado ou publicado

**Segurança:**
- Validação de `chat_id` contra whitelist (`TELEGRAM_ALLOWED_CHAT_IDS`)
- Rejeitar mensagens de usuários não autorizados
- Log de todas as ações para auditoria

**Estrutura:**

```
instapost-bot/
├── src/
│   ├── bot.ts              # Instância do grammy
│   ├── commands/
│   │   ├── start.ts
│   │   ├── novopost.ts
│   │   ├── gerar.ts
│   │   ├── agendar.ts
│   │   ├── listar.ts
│   │   └── publicar.ts
│   ├── conversations/
│   │   └── createPost.ts   # Fluxo conversacional
│   ├── middleware/
│   │   └── auth.ts         # Whitelist de chat_ids
│   ├── api-client.ts       # Cliente HTTP para o backend
│   └── index.ts
├── Dockerfile
├── package.json
└── tsconfig.json
```

### 3.7 MCP Server (Integração Cowork)

Servidor MCP que expoe tools para o Claude/Cowork interagir com o sistema.

**Tools expostas:**

| Tool | Parâmetros | Descrição |
|------|-----------|-----------|
| `create_post` | caption, image_prompt, scheduled_at, hashtags, tone | Cria post completo (gera imagem + texto) |
| `generate_image` | prompt, style, aspect_ratio | Gera imagem via Nano Banana |
| `generate_caption` | topic, tone, hashtags_count, language, max_length | Gera legenda otimizada |
| `schedule_post` | post_id, datetime | Agenda publicação |
| `list_posts` | status, limit, offset, date_range | Lista posts por filtro |
| `publish_now` | post_id | Publica imediatamente |
| `upload_image` | image_base64, filename | Upload de imagem para MinIO |
| `get_analytics` | period | Retorna métricas |

**Exemplo de uso no Cowork:**

O usuário diz: "Crie 5 posts sobre IA para a próxima semana, agendando um por dia às 10h"

O Cowork usa a Skill de criação de posts + as tools MCP para gerar as 5 imagens, criar 5 legendas personalizadas e agendar cada uma automaticamente.

**Estrutura:**

```
instapost-mcp/
├── src/
│   ├── index.ts            # Entry point do servidor MCP
│   ├── tools/
│   │   ├── createPost.ts
│   │   ├── generateImage.ts
│   │   ├── generateCaption.ts
│   │   ├── schedulePost.ts
│   │   ├── listPosts.ts
│   │   ├── publishNow.ts
│   │   ├── uploadImage.ts
│   │   └── getAnalytics.ts
│   ├── api-client.ts       # Cliente HTTP para o backend
│   └── types.ts
├── Dockerfile
├── package.json
└── tsconfig.json
```

### 3.8 Dashboard Web

Interface visual moderna com Next.js 14 + Tailwind + shadcn/ui.

**Telas:**

| Tela | Funcionalidades |
|------|----------------|
| `/` Dashboard | Visão geral: próximos posts, métricas, calendário mini |
| `/posts/new` Criar Post | Editor com preview, gerador de imagem, editor de legenda |
| `/posts` Lista | Tabela/grid com todos os posts, filtros, ações em lote |
| `/calendar` Calendário | Visão mensal/semanal, drag & drop para reagendar |
| `/library` Biblioteca | Galeria de imagens geradas e uploadadas |
| `/settings` Configurações | Conexão Instagram, API keys, preferências |
| `/analytics` Analytics | Métricas de engajamento, melhores horários |

**Design:**
- Tema escuro como padrão (dark mode)
- Cores: azul escuro (#0F3460), rosa (#E94560), fundo (#0A0A0A)
- Componentes shadcn/ui para consistência
- Totalmente responsivo (mobile-first)

---

## 4. Sistema de Agendamento

Usa BullMQ + Redis para garantir publicação no horário exato com retry automático.

**Fluxo:**

1. Post é criado com status `SCHEDULED` e horário definido
2. Job é adicionado à fila do BullMQ com delay calculado (`scheduledAt - now`)
3. No horário, o worker processa o job e chama a Instagram API
4. Em caso de falha: retry automático com backoff exponencial (3 tentativas)
5. Status é atualizado no banco e notificação enviada via Telegram

**Configuração do worker:**

```typescript
// src/jobs/publish.worker.ts
import { Worker } from 'bullmq';
import { publishToInstagram } from '../services/instagram.service';
import { prisma } from '../config/database';

const publishWorker = new Worker('publish-queue', async (job) => {
  const { postId } = job.data;

  await prisma.post.update({
    where: { id: postId },
    data: { status: 'PUBLISHING' },
  });

  try {
    const result = await publishToInstagram(postId);
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        instagramId: result.id,
      },
    });
  } catch (error) {
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'FAILED' },
    });
    throw error; // BullMQ fará retry
  }
}, {
  connection: redis,
  limiter: { max: 10, duration: 60000 }, // Max 10 posts/min
});
```

---

## 5. Segurança

| Área | Implementação |
|------|--------------|
| Autenticação Web | JWT tokens com refresh token rotation |
| API Keys | Armazenadas em variáveis de ambiente, nunca no código |
| Telegram Bot | Validação de chat_id autorizado (whitelist) |
| MCP Server | Autenticação via token Bearer |
| Instagram Token | Long-lived token com refresh automático a cada 60 dias |
| Upload de Imagens | Validação de tipo MIME, limite de tamanho (10MB) |
| Rate Limiting | Express rate-limit em todas as rotas públicas |
| MinIO | Acesso interno via rede Docker, apenas leitura pública |

---

## 6. Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=postgresql://instapost:password@postgres:5432/instapost

# Redis
REDIS_URL=redis://redis:6379

# Instagram
INSTAGRAM_ACCESS_TOKEN=seu_token_aqui
INSTAGRAM_USER_ID=seu_ig_user_id

# Nano Banana
NANO_BANANA_API_KEY=sua_api_key
NANO_BANANA_ENDPOINT=https://api.nanobananaapi.ai/v1/generate
NANO_BANANA_PROVIDER=nanobananaapi  # google | nanobananaapi | fal | piapi

# Telegram
TELEGRAM_BOT_TOKEN=seu_bot_token
TELEGRAM_ALLOWED_CHAT_IDS=123456789,987654321

# MinIO (Storage de Imagens)
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin_secret
MINIO_PUBLIC_URL=https://s3.instapost.com.br
MINIO_BUCKET=instapost-images

# Auth
JWT_SECRET=seu_jwt_secret
JWT_EXPIRES_IN=7d

# MCP
MCP_AUTH_TOKEN=seu_mcp_token

# App
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://app.instapost.com.br
```

---

## 7. Deploy com Coolify

### 7.1 Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: ./instapost-api
    ports:
      - '3001:3001'
    depends_on:
      - postgres
      - redis
      - minio
    env_file: .env
    restart: unless-stopped

  web:
    build: ./instapost-web
    ports:
      - '3000:3000'
    depends_on:
      - api
    environment:
      - NEXT_PUBLIC_API_URL=https://api.instapost.com.br
    restart: unless-stopped

  telegram-bot:
    build: ./instapost-bot
    depends_on:
      - api
    env_file: .env
    restart: unless-stopped

  mcp-server:
    build: ./instapost-mcp
    ports:
      - '3002:3002'
    depends_on:
      - api
    env_file: .env
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: instapost
      POSTGRES_USER: instapost
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - '5432:5432'
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    ports:
      - '6379:6379'
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    volumes:
      - miniodata:/data
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    ports:
      - '9000:9000'
      - '9001:9001'
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
  miniodata:
```

### 7.2 Setup no Coolify

1. Instalar Coolify na VPS: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
2. Acessar painel Coolify (porta 8000)
3. Adicionar recurso: Docker Compose → apontar para o repositório Git
4. Configurar domínios no Coolify:
   - `app.instapost.com.br` → web:3000
   - `api.instapost.com.br` → api:3001
   - `s3.instapost.com.br` → minio:9000
5. Coolify gera certificados SSL automaticamente via Let's Encrypt
6. Configurar variáveis de ambiente no painel do Coolify
7. Deploy automático via webhook do Git (push → deploy)

---

## 8. Roadmap de Desenvolvimento

### Fase 1: MVP (2-3 semanas)
- Setup do projeto (monorepo, TypeScript, ESLint, Prettier)
- Banco de dados: Prisma schema + migrations
- Backend: CRUD de posts (endpoints REST)
- MinIO: serviço de storage de imagens
- Integração Nano Banana: geração de imagens
- Instagram: serviço de publicação via Graph API
- Agendamento: BullMQ workers + scheduler
- Frontend: Dashboard básico (criar, listar, agendar)
- Auth: JWT + login
- Deploy inicial no Coolify

### Fase 2: Telegram + MCP (1-2 semanas)
- Telegram Bot: comandos básicos + fluxo conversacional
- MCP Server: implementar todas as 8 tools
- Skill Cowork: criar SKILL.md para criação de posts
- Telegram: botões inline para aprovação de posts

### Fase 3: Polish (1 semana)
- Analytics e métricas de engajamento
- Calendário visual com drag & drop
- Sugestão automática de melhores horários
- Upload em lote de imagens
- Suporte a carrossel (múltiplas imagens)
- Suporte a Reels (vídeo)
- Testes automatizados (Jest + Supertest)
