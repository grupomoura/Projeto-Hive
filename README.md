# InstaPost AI

Open-source platform for creating, scheduling, and managing social media content with AI.

## Features

- **Post Management** - Create, edit, schedule posts with AI-generated captions and images
- **Calendar View** - Visual scheduling calendar
- **Task Management** - Track recording/publishing tasks with priorities and deadlines
- **Project Management** - Organize content into projects with modules
- **Sales Funnels** - Visual funnel builder with React Flow (drag, connect, inline CRUD)
- **YouTube Clips** - Extract best moments from YouTube videos, create vertical clips with face detection and subtitles
- **Telegram Bot** - Create and manage posts from Telegram
- **MCP Server** - 24 AI tools for Claude Code / Claude Desktop integration
- **Team Management** - Invite members with role-based permissions (Owner, Admin, Editor, Viewer)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API | Express + Prisma + BullMQ |
| Web | Next.js 14 + Tailwind CSS |
| Bot | Grammy.js (Telegram) |
| MCP | @modelcontextprotocol/sdk |
| DB | PostgreSQL 16 |
| Cache | Redis 7 |
| Storage | MinIO (S3-compatible) |
| Video | Python + FFmpeg + Whisper + OpenCV |
| Infra | Docker Compose |

## Quick Start (VPS / Production)

```bash
git clone https://github.com/NetoNetoArreche/instapost.git
cd instapost
bash setup.sh --production
```

This will:
1. Generate `.env` with random secrets
2. Start all services via Docker (Postgres, Redis, MinIO, API, Web, Bot, MCP, Video Worker)
3. Run database migrations
4. Create admin user (`admin@instapost.local` / `admin123`)

Open `http://YOUR_IP:3000` and login.

## Quick Start (Local Development)

```bash
git clone https://github.com/NetoNetoArreche/instapost.git
cd instapost
bash setup.sh
npm run dev
```

This will:
1. Generate `.env` with random secrets
2. Start infrastructure via Docker (Postgres, Redis, MinIO)
3. Install npm dependencies and run migrations
4. Create admin user

Then run `npm run dev` to start API + Web + Bot in development mode.

## Manual Setup

```bash
# 1. Copy env
cp .env.example .env
# Edit .env with your values

# 2. Start infrastructure
docker compose up -d

# 3. Install dependencies
npm install

# 4. Run migrations
npx prisma migrate deploy --schema=packages/api/prisma/schema.prisma

# 5. Start dev
npm run dev
```

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| web | 3000 | Next.js frontend |
| api | 3001 | Express API |
| mcp | 3002 | MCP Server |
| postgres | 5433 | PostgreSQL database |
| redis | 6379 | Redis cache + job queue |
| minio | 9000 | S3-compatible file storage |
| minio-console | 9001 | MinIO admin UI |
| video-worker | - | YouTube clips processor |
| bot | - | Telegram bot |

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Random secret for JWT tokens |
| `INTERNAL_SERVICE_TOKEN` | Yes | Auth token for bot/MCP |
| `MINIO_*` | Yes | MinIO storage config |
| `REDIS_URL` | Yes | Redis connection string |
| `INSTAGRAM_ACCESS_TOKEN` | No | Instagram Graph API token |
| `NANO_BANANA_API_KEY` | No | Google Gemini API key for image/caption generation |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot token |

## Project Structure

```
instapost/
  packages/
    api/          Express + Prisma + BullMQ
    web/          Next.js 14 + Tailwind
    bot/          Telegram bot (Grammy.js)
    mcp/          MCP server (24 tools)
    shared/       Shared TypeScript types
  scripts/
    video/        Python scripts for YouTube clips
  Dockerfile.*    Docker images for each service
  docker-compose.yml           Dev (infra only)
  docker-compose.production.yml  Production (all services)
  setup.sh        Automated setup script
```

## MCP Tools

Connect to `http://localhost:3002/mcp` from Claude Code or Claude Desktop.

24 tools available: create/list/update/delete for posts, tasks, projects, modules + image generation, caption generation, scheduling, publishing, analytics, YouTube video analysis and clipping.

## YouTube Clips

1. Paste a YouTube URL in `/clips/new`
2. The system downloads, transcribes (Whisper), and finds the best moments
3. Select moments and generate vertical clips (1080x1920) with:
   - Face detection (OpenCV)
   - Content + face cam split layout
   - Auto-generated subtitles (.srt + .ass)
   - Optional burned-in subtitles

## License

[AGPL-3.0](LICENSE)
