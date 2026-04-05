# OpenHive AI

Plataforma open-source de criacao e gestao de conteudo para redes sociais com IA.

Crie posts com imagens e legendas geradas por IA, agende publicacoes, extraia clips de videos do YouTube, gerencie tarefas, projetos e funis de vendas. Integra com Instagram, Telegram, Claude e Gemini (via MCP).

---

## O que o OpenHive faz

- **Posts com IA** - Gera imagens (Google Gemini) e legendas, publica no Instagram
- **Carrossel** - Crie carrosseis com 2-10 slides (HTML/Tailwind renderizado ou IA)
- **Calendario** - Visualize e agende posts em calendario
- **Tarefas** - Gerencie gravacoes e publicacoes com prioridades e prazos
- **Projetos** - Organize conteudo em projetos com modulos
- **Funis de Vendas** - Construtor visual com drag and drop (React Flow)
- **YouTube Clips** - Extraia melhores momentos, crie clips verticais com face cam e legendas
- **Telegram Bot** - Crie e gerencie posts direto pelo Telegram
- **MCP Server** - 26 tools pra usar com Claude, Gemini Antigravity, Cursor e outros
- **Equipe** - Convide membros com permissoes por pagina
- **Multi-Instagram** - Conecte varias contas do Instagram

---

## Arquitetura

```
┌─────────────────────────────────────────────────┐
│                    Clientes                      │
│  Web (3000)  │  Telegram Bot  │  MCP (3002)     │
└──────┬───────┴───────┬────────┴──────┬──────────┘
       │               │               │
       ▼               ▼               ▼
┌─────────────────────────────────────────────────┐
│              API Express (3001)                  │
│  Auth │ Posts │ Tasks │ Projects │ Funnels       │
│  Generate │ Upload │ Instagram │ Video Clips     │
└──┬──────┬──────┬──────┬──────┬──────────────────┘
   │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼
 Postgres Redis  MinIO  Gemini  Renderer (3003)
  (5432)  (6379) (9000)  API    Puppeteer+Chromium
```

### Packages

| Package | Descricao | Porta |
|---------|-----------|-------|
| `packages/api` | API REST (Express + Prisma + BullMQ) | 3001 |
| `packages/web` | Frontend (Next.js 14 + Tailwind) | 3000 |
| `packages/bot` | Telegram Bot (grammy.js) | - |
| `packages/mcp` | MCP Server HTTP (26 tools) | 3002 |
| `packages/mcp-cli` | MCP CLI para IDEs externas (npm) | - |
| `packages/shared` | Tipos TypeScript compartilhados | - |
| `scripts/renderer` | HTML para PNG (Puppeteer) | 3003 |
| `scripts/video` | Video Worker (Python + ffmpeg) | - |

### Portas

| Porta | Servico | Uso |
|-------|---------|-----|
| 3000 | Web (Next.js) | Dashboard |
| 3001 | API (Express) | REST API |
| 3002 | MCP Server | Model Context Protocol |
| 3003 | Renderer | HTML para PNG |
| 5432 | PostgreSQL | Banco de dados (interno Docker) |
| 5433 | PostgreSQL | Banco de dados (dev local, evita conflito) |
| 6379 | Redis | Filas BullMQ |
| 9000 | MinIO API | Storage S3 |
| 9001 | MinIO Console | UI do MinIO |

---

## Como instalar

O OpenHive usa **Docker Compose** em todos os cenarios. Escolha a opcao que se encaixa no seu caso:

| Cenario | O que acontece | Arquivo |
|---------|---------------|---------|
| **Desenvolvimento local** | Docker Compose sobe o banco, cache e storage. A aplicacao roda com `npm run dev`. | `docker-compose.yml` |
| **VPS com SSH** | Docker Compose sobe **tudo** (infra + app) com um unico comando. | `docker-compose.production.yml` |
| **Coolify** | Voce aponta o repo e o Coolify usa o Docker Compose pra buildar e rodar tudo. | `docker-compose.prod.yml` |
| **Easypanel** | Voce cria cada servico no painel apontando pros Dockerfiles do repo. | Dockerfiles individuais |

> **Resumo:** em todos os casos voce precisa de Docker. A unica diferenca e se voce roda `docker compose` direto no terminal ou se uma plataforma (Coolify/Easypanel) faz isso por voce.

---

## Instalacao Local (Desenvolvimento)

### Pre-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ja inclui Docker Compose)
- [Node.js 22 LTS](https://nodejs.org/) (recomendado via [fnm](https://github.com/Schniz/fnm) ou [nvm](https://github.com/nvm-sh/nvm))
- Git

> **Por que Docker?** O Docker Compose sobe automaticamente o banco de dados (PostgreSQL), cache (Redis) e storage de imagens (MinIO). Voce nao precisa instalar nenhum desses manualmente.

### Passo a passo

#### 1. Clone o repositorio

```bash
git clone https://github.com/NetoNetoArreche/instapost.git
cd instapost
```

#### 2. Configure o ambiente

```bash
cp .env.example .env
```

Abra o `.env` e substitua os valores `CHANGE_ME` por senhas seguras (ou use o setup automatico no passo abaixo).

#### 3. Suba a infraestrutura com Docker Compose

```bash
docker compose up -d
```

Isso inicia 3 containers:

| Container | Servico | Porta |
|-----------|---------|-------|
| `instapost-postgres` | PostgreSQL 16 | 5433 (mapeada de 5432 interna) |
| `instapost-redis` | Redis 7 | 6379 |
| `instapost-minio` | MinIO (S3) | 9000 (API) / 9001 (Console) |

Verifique se estao rodando:

```bash
docker compose ps
```

Os 3 devem aparecer como **running (healthy)**.

#### 4. Instale dependencias e rode migrations

```bash
npm install
npx prisma migrate deploy --schema=packages/api/prisma/schema.prisma
```

#### 5. Inicie a aplicacao

```bash
npm run dev
```

Acesse:
- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **MCP**: http://localhost:3002/mcp
- **MinIO Console**: http://localhost:9001

#### 6. Crie sua conta

Abra http://localhost:3000, clique em **Registrar** e crie sua conta. O primeiro usuario criado sera o Owner.

### Setup automatico (alternativa)

Se preferir, o script `setup.sh` faz tudo de uma vez (gera .env com secrets aleatorios, sobe Docker, instala deps, roda migrations e cria usuario admin):

```bash
bash setup.sh
```

Login padrao: `admin@instapost.local` / `admin123` (troque depois!)

### Comandos uteis do Docker Compose

```bash
# Ver status dos containers
docker compose ps

# Ver logs de um servico especifico
docker compose logs postgres
docker compose logs redis
docker compose logs minio

# Parar tudo (dados persistem nos volumes)
docker compose down

# Parar e apagar todos os dados (recomecar do zero)
docker compose down -v

# Reiniciar um servico
docker compose restart postgres
```

### Renderer Service (para carrosseis HTML)

O renderer e necessario para a funcionalidade de carrossel com HTML/CSS/Tailwind. Em dev local, rode separado:

```bash
docker compose -f docker-compose.production.yml up renderer -d
```

---

## Instalacao via Docker Compose (VPS com SSH)

Para VPS com acesso SSH direto (sem Coolify/Easypanel). O Docker Compose sobe **tudo** — infra e aplicacao — em containers.

### Pre-requisitos

- VPS Ubuntu 22+ (minimo 2GB RAM)
- Docker e Docker Compose instalados ([como instalar Docker no Ubuntu](https://docs.docker.com/engine/install/ubuntu/))
- Git

### O que o Docker Compose cria

O arquivo `docker-compose.production.yml` sobe **8 containers**:

| Container | Servico | Porta exposta |
|-----------|---------|---------------|
| `instapost-postgres` | PostgreSQL 16 (banco de dados) | interna (5432) |
| `instapost-redis` | Redis 7 (filas e cache) | interna (6379) |
| `instapost-minio` | MinIO (storage S3 para imagens) | 9000 / 9001 |
| `instapost-api` | API Express (backend) | 3001 |
| `instapost-web` | Next.js (frontend) | 3000 |
| `instapost-bot` | Telegram Bot | - |
| `instapost-mcp` | MCP Server (26 tools) | 3002 |
| `renderer` | Puppeteer (HTML para PNG) | 3003 |

### Passo a passo

#### 1. Clone e rode o setup

```bash
git clone https://github.com/NetoNetoArreche/instapost.git
cd instapost
bash setup.sh --production
```

O `setup.sh --production`:
- Gera o `.env` com secrets aleatorios
- Roda `docker compose -f docker-compose.production.yml up -d` (builda e sobe tudo)
- Executa migrations do banco dentro do container da API
- Cria o usuario admin

#### 2. Verifique se esta tudo rodando

```bash
docker compose -f docker-compose.production.yml ps
```

Todos os containers devem aparecer como **running**.

#### 3. Acesse

- **Web**: `http://SEU_IP:3000`
- **API**: `http://SEU_IP:3001`
- **MCP**: `http://SEU_IP:3002/mcp`
- **MinIO Console**: `http://SEU_IP:9001`

Login padrao: `admin@instapost.local` / `admin123` (troque depois!)

### Comandos uteis (producao)

```bash
# Ver status
docker compose -f docker-compose.production.yml ps

# Ver logs de um servico
docker compose -f docker-compose.production.yml logs api
docker compose -f docker-compose.production.yml logs web

# Reiniciar tudo
docker compose -f docker-compose.production.yml restart

# Atualizar para nova versao
git pull
docker compose -f docker-compose.production.yml up -d --build

# Parar tudo (dados persistem)
docker compose -f docker-compose.production.yml down
```

### Configurar dominio com proxy reverso

Use Nginx ou Caddy na frente dos containers:

```nginx
# /etc/nginx/sites-available/openhive
server {
    server_name app.seudominio.com;
    location / { proxy_pass http://127.0.0.1:3000; }
}
server {
    server_name api.seudominio.com;
    location / { proxy_pass http://127.0.0.1:3001; }
}
server {
    server_name mcp.seudominio.com;
    location / { proxy_pass http://127.0.0.1:3002; }
}
server {
    server_name s3.seudominio.com;
    location / { proxy_pass http://127.0.0.1:9000; }
}
```

Apos configurar o dominio, atualize no `.env` e reinicie:
```bash
# Edite o .env
FRONTEND_URL=https://app.seudominio.com
MINIO_PUBLIC_URL=https://s3.seudominio.com

# Reinicie para aplicar
docker compose -f docker-compose.production.yml up -d
```

---

## Instalacao no Coolify

O Coolify e uma plataforma self-hosted que gerencia Docker Compose por voce. Ele le o arquivo `docker-compose.prod.yml` do repositorio, builda as imagens e sobe todos os containers automaticamente.

### Pre-requisitos

- VPS Ubuntu 22+ (minimo 2GB RAM)
- Coolify instalado ([como instalar](https://coolify.io/docs/installation))

### O que o Coolify faz por voce

Ao apontar o Coolify para este repositorio, ele usa o `docker-compose.prod.yml` que sobe:

| Servico no Compose | O que e | Porta |
|---------------------|---------|-------|
| `postgres` | PostgreSQL 16 | interna |
| `redis` | Redis 7 (com senha) | interna |
| `minio` | MinIO (storage S3) | 9000 / 9001 |
| `api` | API Express (backend) | 3001 |
| `web` | Next.js (frontend) | 3000 |
| `telegram-bot` | Telegram Bot | - |
| `mcp-server` | MCP Server (26 tools) | 3002 |
| `renderer` | Puppeteer (HTML para PNG) | 3003 |

O Coolify cuida de: build das imagens, SSL automatico, dominios, restart e logs.

### Passo 1: Criar o projeto

1. Acesse o painel do Coolify (ex: `http://sua-vps:8000`)
2. **Projects** > **Add New Project** > nomeie "OpenHive"

### Passo 2: Adicionar como Docker Compose

1. Dentro do projeto, clique **+ New** > **Resource**
2. Selecione **Docker Compose**
3. Em **Git Repository** > **Public Repository**
4. URL: `https://github.com/NetoNetoArreche/instapost.git`
5. Branch: `main`
6. Docker Compose Location: `/docker-compose.prod.yml`
7. Base Directory: `/`
8. Clique **Save**

> **Importante:** o Coolify vai ler o `docker-compose.prod.yml` e criar todos os servicos automaticamente. Voce nao precisa criar containers manualmente.

### Passo 3: Configurar variaveis de ambiente

Va em **Environment Variables** e adicione (gere senhas fortes para cada `CHANGE_ME`):

```bash
# Senhas da infraestrutura (gere com: openssl rand -hex 16)
DB_PASSWORD=CHANGE_ME
REDIS_PASSWORD=CHANGE_ME
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=CHANGE_ME

# Seguranca (gere com: openssl rand -hex 32)
JWT_SECRET=CHANGE_ME
INTERNAL_SERVICE_TOKEN=CHANGE_ME

# URLs (ajuste para seus dominios)
FRONTEND_URL=https://app.seudominio.com
MINIO_PUBLIC_URL=https://s3.seudominio.com

# Google Gemini (para gerar imagens/legendas)
NANO_BANANA_API_KEY=sua_chave_do_google_ai_studio
NANO_BANANA_PROVIDER=google

# Telegram Bot (opcional)
TELEGRAM_BOT_TOKEN=token_do_botfather
TELEGRAM_ALLOWED_CHAT_IDS=seu_chat_id
```

### Passo 4: Configurar dominios

Em **Configuration** > **General**, configure dominios para cada servico:

| Servico | Dominio sugerido | Porta |
|---------|-----------------|-------|
| **web** | `app.seudominio.com` | 3000 |
| **api** | `api.seudominio.com` | 3001 |
| **mcp-server** | `mcp.seudominio.com` | 3002 |
| **minio** | `s3.seudominio.com` | 9000 |

O Coolify gera SSL automaticamente se voce tiver um dominio configurado.

### Passo 5: Deploy

1. Clique **Deploy**
2. Aguarde ~10 minutos no primeiro deploy (build das imagens)
3. Quando aparecer **Running (healthy)**, esta pronto

### Passo 6: Acessar

1. Abra `https://app.seudominio.com`
2. Clique **Registrar** e crie sua conta (primeiro usuario = Owner)
3. Va em **Configuracoes** e configure as integracoes (Gemini, Instagram, etc)

URL do MCP: `https://mcp.seudominio.com/mcp`

---

## Instalacao no Easypanel

O Easypanel e um painel de controle self-hosted para Docker. Diferente do Coolify, ele nao le Docker Compose diretamente — voce cria cada servico individualmente apontando para os Dockerfiles do repositorio. O Easypanel cuida do build, deploy, SSL e dominios.

### Pre-requisitos

- VPS Ubuntu 22+ (minimo 2GB RAM)
- Easypanel instalado ([como instalar](https://easypanel.io/docs/get-started))

### Visao geral dos servicos

Voce vai criar **7 servicos** no Easypanel, cada um com seu Dockerfile:

| Servico | Tipo no Easypanel | Dockerfile | Porta | Dominio |
|---------|-------------------|------------|-------|---------|
| Postgres | Database > Postgres 16 | (imagem pronta) | interno | - |
| Redis | Database > Redis | (imagem pronta) | interno | - |
| MinIO | App > Docker Image | (imagem pronta) | 9000/9001 | `s3.seudominio.com` |
| API | App > Github | `packages/api/Dockerfile` | 3001 | `api.seudominio.com` |
| Web | App > Github | `packages/web/Dockerfile` | 3000 | `app.seudominio.com` |
| MCP Server | App > Github | `packages/mcp/Dockerfile` | 3002 | `mcp.seudominio.com` |
| Renderer | App > Github | `Dockerfile.renderer` | 3003 | - |
| Bot (opcional) | App > Github | `packages/bot/Dockerfile` | - | - |

### Passo 1: Criar projeto e infraestrutura

1. Acesse o Easypanel > **Create Project** > nome: "openhive"

2. **Postgres**: + Service > Databases > Postgres 16
   - Anote a connection string (ex: `postgres://user:pass@postgres.openhive.internal:5432/db`)

3. **Redis**: + Service > Databases > Redis
   - Anote a connection string (ex: `redis://default:pass@redis.openhive.internal:6379`)

4. **MinIO**: + Service > App > Docker Image
   - Image: `minio/minio:latest`
   - Command: `server /data --console-address :9001`
   - Portas: `9000` e `9001`
   - Env: `MINIO_ROOT_USER=minioadmin`, `MINIO_ROOT_PASSWORD=CHANGE_ME`
   - Configure dominio para porta 9000 (ex: `s3.seudominio.com`)

### Passo 2: Servico API (backend)

1. + Service > App > Github
2. Repo: `NetoNetoArreche/instapost`, Branch: `main`
3. Dockerfile: `packages/api/Dockerfile`
4. Porta: `3001`
5. Configure dominio: `api.seudominio.com`
6. Env vars (substitua os valores entre `< >` pelos dados reais do Passo 1):

```bash
NODE_ENV=production
PORT=3001

# Banco - use a connection string do Postgres criado no Passo 1
DATABASE_URL=postgres://<user>:<pass>@postgres.openhive.internal:5432/<db>

# Redis - use a connection string do Redis criado no Passo 1
REDIS_URL=redis://default:<pass>@redis.openhive.internal:6379

# Seguranca (gere com: openssl rand -hex 32)
JWT_SECRET=CHANGE_ME
JWT_EXPIRES_IN=7d
INTERNAL_SERVICE_TOKEN=CHANGE_ME

# MinIO - use a senha definida no Passo 1
MINIO_ENDPOINT=minio.openhive.internal
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=CHANGE_ME
MINIO_PUBLIC_URL=https://s3.seudominio.com
MINIO_BUCKET=openhive-images

# URLs
FRONTEND_URL=https://app.seudominio.com

# Google Gemini (gerar imagens/legendas)
NANO_BANANA_API_KEY=sua_chave_do_google_ai_studio
NANO_BANANA_PROVIDER=google
```

7. Deploy

### Passo 3: Servico Web (frontend)

1. + Service > App > Github
2. Repo: `NetoNetoArreche/instapost`, Branch: `main`
3. Dockerfile: `packages/web/Dockerfile`
4. Porta: `3000`
5. Configure dominio: `app.seudominio.com`
6. Env:
```
API_INTERNAL_URL=http://api.openhive.internal:3001
```
7. Deploy

### Passo 4: MCP Server

1. + Service > App > Github
2. Repo: `NetoNetoArreche/instapost`, Branch: `main`
3. Dockerfile: `packages/mcp/Dockerfile`
4. Porta: `3002`
5. Configure dominio: `mcp.seudominio.com`
6. Env (use o mesmo `INTERNAL_SERVICE_TOKEN` da API):
```
API_URL=http://api.openhive.internal:3001
API_TOKEN=mesmo_INTERNAL_SERVICE_TOKEN_da_api
```
7. Deploy

### Passo 5: Renderer (para carrosseis HTML)

1. + Service > App > Github
2. Repo: `NetoNetoArreche/instapost`, Branch: `main`
3. Dockerfile: `Dockerfile.renderer`
4. Porta: `3003`
5. Sem env vars necessarias
6. Deploy

### Passo 6: Telegram Bot (opcional)

1. + Service > App > Github
2. Repo: `NetoNetoArreche/instapost`, Branch: `main`
3. Dockerfile: `packages/bot/Dockerfile`
4. Sem porta (nao precisa expor)
5. Env:
```
API_URL=http://api.openhive.internal:3001
API_TOKEN=mesmo_INTERNAL_SERVICE_TOKEN_da_api
TELEGRAM_BOT_TOKEN=token_do_botfather
TELEGRAM_ALLOWED_CHAT_IDS=seu_chat_id
```
6. Deploy

### Passo 7: Acessar

1. Abra `https://app.seudominio.com`
2. Clique **Registrar** e crie sua conta (primeiro usuario = Owner)
3. Va em **Configuracoes** e configure integracoes (Gemini, Instagram, etc)

URL do MCP: `https://mcp.seudominio.com/mcp`

---

## Variaveis de Ambiente (.env)

```bash
# === Banco de Dados ===
DB_PASSWORD=senha_forte                    # Senha do Postgres
DATABASE_URL=postgresql://instapost:SENHA@localhost:5433/instapost  # Dev local
# DATABASE_URL=postgresql://instapost:SENHA@postgres:5432/instapost # Docker prod

# === Redis ===
REDIS_URL=redis://localhost:6379           # Dev local
# REDIS_URL=redis://:senha@redis:6379     # Docker prod com senha

# === JWT ===
JWT_SECRET=openssl_rand_hex_32             # Gere com: openssl rand -hex 32
JWT_EXPIRES_IN=7d

# === Token interno (Bot + MCP autenticam na API) ===
INTERNAL_SERVICE_TOKEN=openssl_rand_hex_24 # Gere com: openssl rand -hex 24

# === MinIO (Storage S3) ===
MINIO_ENDPOINT=localhost                   # Dev: localhost | Docker: minio
MINIO_PORT=9000
MINIO_USE_SSL=false                        # true se usar HTTPS
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=senha_minio
MINIO_PUBLIC_URL=http://localhost:9000     # URL publica para acessar imagens
MINIO_BUCKET=instapost-images

# === Frontend ===
FRONTEND_URL=http://localhost:3000         # URL do web app
WEB_PORT=3000

# === MCP Server ===
MCP_PORT=3002

# === Geracao de Imagens (Google Gemini) ===
NANO_BANANA_API_KEY=                       # Chave do Google AI Studio
NANO_BANANA_PROVIDER=google               # google | nanobananaapi | fal

# === Instagram (opcional) ===
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# === Telegram Bot (opcional) ===
TELEGRAM_BOT_TOKEN=                        # Token do BotFather
TELEGRAM_ALLOWED_CHAT_IDS=                 # IDs dos chats permitidos
```

---

## Conectar MCP (IDEs e Agentes)

O OpenHive expoe 26 tools via Model Context Protocol. Ha duas formas de conectar:

### Opcao 1: MCP Server HTTP (ja incluso no projeto)

Quando voce roda o OpenHive (local ou VPS), o MCP Server HTTP ja sobe automaticamente na porta 3002. Nao precisa instalar nada extra.

**URL do MCP:**
- Local: `http://localhost:3002/mcp`
- VPS: `https://mcp.seudominio.com/mcp`

**Claude Cowork**: Personalizar > Conectores > + Adicionar > cole a URL do MCP

**Claude Desktop**: Settings > MCP Servers > Add Server > cole a URL do MCP

### Opcao 2: MCP CLI via npx (para IDEs com Stdio)

Usado pelo **Gemini Antigravity**, **Cursor**, **VS Code**, **Claude Code** e qualquer IDE que suporte MCP via comando stdio.

**Nao precisa instalar nada manualmente.** O `npx -y` baixa e executa o pacote automaticamente. Basta adicionar a configuracao JSON na sua IDE.

O `OPENHIVE_API_URL` deve apontar pra sua API:
- Se roda **local**: `http://localhost:3001`
- Se roda em **VPS**: `https://api.seudominio.com`

O `OPENHIVE_API_TOKEN` e o mesmo valor do `INTERNAL_SERVICE_TOKEN` que esta no seu `.env`.

**Gemini Antigravity** (`~/.gemini/antigravity/mcp_config.json`):
```json
{
  "mcpServers": {
    "openhive": {
      "command": "npx",
      "args": ["-y", "openhive-mcp-server@1.1.0"],
      "env": {
        "OPENHIVE_API_URL": "http://localhost:3001",
        "OPENHIVE_API_TOKEN": "seu_INTERNAL_SERVICE_TOKEN"
      }
    }
  }
}
```

**Claude Code** (`~/.claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "openhive": {
      "command": "npx",
      "args": ["-y", "openhive-mcp-server@1.1.0"],
      "env": {
        "OPENHIVE_API_URL": "http://localhost:3001",
        "OPENHIVE_API_TOKEN": "seu_INTERNAL_SERVICE_TOKEN"
      }
    }
  }
}
```

**Cursor** (`.cursor/mcp.json` na raiz do projeto):
```json
{
  "mcpServers": {
    "openhive": {
      "command": "npx",
      "args": ["-y", "openhive-mcp-server@1.1.0"],
      "env": {
        "OPENHIVE_API_URL": "http://localhost:3001",
        "OPENHIVE_API_TOKEN": "seu_INTERNAL_SERVICE_TOKEN"
      }
    }
  }
}
```

**VS Code** (`.vscode/mcp.json`):
```json
{
  "servers": {
    "openhive": {
      "command": "npx",
      "args": ["-y", "openhive-mcp-server@1.1.0"],
      "env": {
        "OPENHIVE_API_URL": "http://localhost:3001",
        "OPENHIVE_API_TOKEN": "seu_INTERNAL_SERVICE_TOKEN"
      }
    }
  }
}
```

### Opcao 3: Plugin Claude Cowork (com Skills)

O plugin inclui skills do OpenHive (carrossel, LinkedIn, Twitter, YouTube, etc) com fluxos guiados.

1. [Baixe o ZIP do plugin](https://drive.google.com/drive/folders/1VeyeIXuZrkkrRDWjv-jv0ph6biKOXPP4?usp=sharing)
2. Extraia numa pasta local
3. No Claude Code:
```bash
/plugin marketplace add ./caminho/para/openhives-plugin
/plugin install openhives
/reload-plugins
```

---

## Configurar Integracoes

Todas configuradas pela interface web em **Configuracoes** (menu lateral).

### Google Gemini (geracao de imagens e legendas)

1. Acesse [aistudio.google.com](https://aistudio.google.com/)
2. **Get API Key** > **Create API Key**
3. No OpenHive > Configuracoes > Geracao de Imagens (Gemini) > cole e salve

### Instagram (publicacao automatica)

1. Acesse [developers.facebook.com](https://developers.facebook.com/)
2. **Meus Apps** > **Criar App** > tipo **Empresa**
3. No app, **Adicionar Produto** > **Instagram** > **Configurar**
4. **Funcoes do app** > adicione sua conta como **Testador do Instagram**
5. No Instagram, aceite o convite (Config > Apps e sites > Convites)
6. Volte ao Facebook > Instagram > Config da API > **Gerar token**
7. No OpenHive:
   - Configuracoes > Chaves de API > cole **App ID** e **App Secret**
   - Contas do Instagram > Adicionar Conta > cole **Access Token** e **User ID**

O token e renovado automaticamente a cada 50 dias.

### Telegram Bot

1. No Telegram, fale com [@BotFather](https://t.me/BotFather) > `/newbot`
2. Copie o token
3. Descubra seu chat ID: fale com [@userinfobot](https://t.me/userinfobot)
4. No OpenHive > Configuracoes > Telegram Bot > cole token e chat ID

### YouTube Clips (cookies)

1. No Chrome, instale **"Get cookies.txt LOCALLY"**
2. Va ao youtube.com logado > exporte cookies
3. No OpenHive > Configuracoes > YouTube Clips > upload do `cookies.txt`

---

## MCP Tools (26)

### Posts
| Tool | Descricao |
|------|-----------|
| `create_post` | Cria post ou carrossel (image_prompt, image_prompts, image_urls) |
| `list_posts` | Lista posts com filtros |
| `add_image_to_post` | Adiciona imagem a post existente (vira carrossel auto) |
| `schedule_post` | Agenda publicacao |
| `publish_now` | Publica imediatamente no Instagram |

### Geracao
| Tool | Descricao |
|------|-----------|
| `generate_image` | Gera imagem via Google Gemini |
| `generate_caption` | Gera legenda otimizada |
| `generate_template_image` | Gera imagem com template HTML pre-definido |
| `render_html_to_image` | Renderiza HTML/CSS/Tailwind em PNG |
| `upload_image` | Upload de imagem base64 |
| `get_analytics` | Metricas dos posts |

### Tarefas
| Tool | Descricao |
|------|-----------|
| `create_task` | Cria tarefa (gravacao, post, patrocinio) |
| `list_tasks` | Lista com filtros |
| `update_task` | Atualiza tarefa |
| `delete_task` | Remove tarefa |

### Projetos
| Tool | Descricao |
|------|-----------|
| `create_project` | Cria projeto com modulos |
| `list_projects` | Lista projetos |
| `get_project` | Detalhes com modulos e tarefas |
| `update_project` | Atualiza projeto |
| `delete_project` | Remove projeto |
| `add_module` | Adiciona modulo |
| `update_module` | Atualiza modulo |
| `delete_module` | Remove modulo |

### Video
| Tool | Descricao |
|------|-----------|
| `analyze_youtube_video` | Analisa video YouTube (transcreve + detecta momentos) |
| `cut_youtube_clips` | Corta clips verticais com face cam e legendas |
| `list_video_clips` | Lista clips |

---

## Telegram Bot - Comandos

| Comando | O que faz |
|---------|-----------|
| `/start` | Lista todos os comandos |
| `/gerar [tema]` | Gera post com imagem e legenda |
| `/gerar 3 [tema]` | Gera carrossel com 3 imagens |
| `/novopost` | Criacao interativa de post |
| `/listar` | Posts agendados |
| `/publicar [id]` | Publica post |
| `/agendar [id] [data] [hora]` | Agenda post |
| `/cancelar [id]` | Cancela agendamento |
| `/tarefas` | Tarefas dos proximos 7 dias |
| `/projetos` | Lista projetos |
| `/funis` | Lista funis |
| `/clip [url]` | Analisa video do YouTube |
| `/clipcortar [id] todos` | Corta clips |
| `/template [titulo]` | Gera imagem com template |
| `/status` | Status das integracoes |

---

## Como usar

### Criar post pela web
Novo Post > digite o tema > IA gera imagem e legenda > revise > publique ou agende

### Criar carrossel pelo MCP (HTML)
1. O agente gera HTML de cada slide
2. Chama `render_html_to_image` para cada slide > coleta as URLs
3. Chama `create_post({ image_urls: [url1, url2, ...], caption: "..." })`

### Criar carrossel pelo MCP (IA)
1. Chama `create_post({ image_prompts: ["slide 1", "slide 2", ...], caption: "..." })`
2. As imagens sao geradas automaticamente via Gemini

### YouTube Clips
1. Clips > Novo Clip > cole URL > Analisar
2. Espere transcricao e deteccao de momentos
3. Selecione momentos > Gerar Clips
4. Download dos clips verticais (1080x1920)

### Funis de Vendas
Funis > Novo Funil > crie etapas e passos > modo Flow pra arrastar e conectar

### Equipe
Equipe > convide por email > defina funcao e paginas permitidas

---

## Licenca

[AGPL-3.0](LICENSE)

Voce pode usar, modificar e distribuir livremente. Se hospedar como servico publico, deve disponibilizar o codigo fonte das suas modificacoes.
