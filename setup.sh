#!/bin/bash
set -e

echo "============================================"
echo "  InstaPost AI - Setup"
echo "============================================"
echo ""

# ── Generate .env if it doesn't exist ──
if [ ! -f .env ]; then
  echo "[1/4] Generating .env from .env.example..."
  cp .env.example .env

  # Generate random secrets
  JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | base64 | tr -d '/+=' | head -c 64)
  INTERNAL_TOKEN=$(openssl rand -hex 24 2>/dev/null || head -c 48 /dev/urandom | base64 | tr -d '/+=' | head -c 48)
  DB_PASS=$(openssl rand -hex 16 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -d '/+=' | head -c 32)
  MINIO_SECRET=$(openssl rand -hex 16 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -d '/+=' | head -c 32)

  # Replace placeholders
  sed -i "s|CHANGE_ME_generate_random_secret|${JWT_SECRET}|g" .env
  sed -i "s|CHANGE_ME_generate_random_token|${INTERNAL_TOKEN}|g" .env
  sed -i "s|CHANGE_ME_strong_password|${DB_PASS}|g" .env
  sed -i "s|CHANGE_ME_minio_secret|${MINIO_SECRET}|g" .env

  echo "  .env created with random secrets"
else
  echo "[1/4] .env already exists, skipping..."
fi

# ── Start infrastructure ──
echo ""
echo "[2/4] Starting Docker services..."

# Detect which compose file to use
if [ "$1" = "--production" ] || [ "$1" = "--prod" ]; then
  COMPOSE_FILE="docker-compose.production.yml"
  echo "  Using production mode (all services in Docker)"
  docker compose -f $COMPOSE_FILE up -d
  echo "  Waiting for services to be healthy..."
  sleep 10

  # Run migrations inside API container
  echo ""
  echo "[3/4] Running database migrations..."
  docker compose -f $COMPOSE_FILE exec api npx prisma migrate deploy --schema=packages/api/prisma/schema.prisma

  echo ""
  echo "[4/4] Creating admin user..."
  docker compose -f $COMPOSE_FILE exec api node -e "
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const prisma = new PrismaClient();
    (async () => {
      const exists = await prisma.user.findFirst({ where: { role: 'OWNER' } });
      if (exists) { console.log('  Admin already exists:', exists.email); return; }
      const hash = await bcrypt.hash('admin123', 10);
      const user = await prisma.user.create({ data: { email: 'admin@instapost.local', password: hash, name: 'Admin', role: 'OWNER' } });
      console.log('  Admin created: admin@instapost.local / admin123');
      console.log('  CHANGE THIS PASSWORD after first login!');
    })().catch(console.error).finally(() => prisma.\$disconnect());
  "
else
  COMPOSE_FILE="docker-compose.yml"
  echo "  Using development mode (only infra in Docker)"
  docker compose -f $COMPOSE_FILE up -d
  echo "  Waiting for services to be healthy..."
  sleep 5

  # Check if npm is available
  if ! command -v npm &> /dev/null; then
    echo "  ERROR: npm not found. Install Node.js 22+ first."
    exit 1
  fi

  echo ""
  echo "[3/4] Installing dependencies & running migrations..."
  npm install
  npx prisma migrate deploy --schema=packages/api/prisma/schema.prisma

  echo ""
  echo "[4/4] Creating admin user..."
  npx tsx -e "
    import { PrismaClient } from '@prisma/client';
    import bcrypt from 'bcryptjs';
    const prisma = new PrismaClient();
    const exists = await prisma.user.findFirst({ where: { role: 'OWNER' } });
    if (exists) { console.log('  Admin already exists:', exists.email); process.exit(0); }
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({ data: { email: 'admin@instapost.local', password: hash, name: 'Admin', role: 'OWNER' } });
    console.log('  Admin created: admin@instapost.local / admin123');
    console.log('  CHANGE THIS PASSWORD after first login!');
    await prisma.\$disconnect();
  "
fi

echo ""
echo "============================================"
echo "  InstaPost AI is ready!"
echo "============================================"
echo ""
if [ "$1" = "--production" ] || [ "$1" = "--prod" ]; then
  echo "  Web:  http://localhost:${WEB_PORT:-3000}"
  echo "  API:  http://localhost:3001"
  echo "  MCP:  http://localhost:${MCP_PORT:-3002}/mcp"
  echo "  MinIO Console: http://localhost:9001"
else
  echo "  Run the app:"
  echo "    npm run dev"
  echo ""
  echo "  Then open: http://localhost:3000"
fi
echo ""
echo "  Login: admin@instapost.local / admin123"
echo "  (change password after first login!)"
echo ""
