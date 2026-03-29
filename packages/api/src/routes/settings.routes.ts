import { Router } from 'express';
import { z } from 'zod';
import { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { prisma } from '../config/database';
import { resolveOwnerId } from '../helpers/resolveOwnerId';
import { env } from '../config/env';

const router = Router();

const ALLOWED_KEYS = [
  'INSTAGRAM_ACCESS_TOKEN',
  'INSTAGRAM_USER_ID',
  'NANO_BANANA_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_ALLOWED_CHAT_IDS',
  'MCP_AUTH_TOKEN',
  'MCP_URL',
];

const NON_SECRET_KEYS = ['MCP_URL', 'TELEGRAM_ALLOWED_CHAT_IDS', 'INSTAGRAM_USER_ID'];

// Check if a key has a value in .env
function getEnvValue(key: string): string | undefined {
  const map: Record<string, string | undefined> = {
    INSTAGRAM_ACCESS_TOKEN: env.INSTAGRAM_ACCESS_TOKEN,
    INSTAGRAM_USER_ID: env.INSTAGRAM_USER_ID,
    NANO_BANANA_API_KEY: env.NANO_BANANA_API_KEY,
    TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_ALLOWED_CHAT_IDS: env.TELEGRAM_ALLOWED_CHAT_IDS,
    MCP_AUTH_TOKEN: env.MCP_AUTH_TOKEN,
  };
  return map[key];
}

router.use(authMiddleware);

// GET /api/settings - Get all settings (DB + env fallback)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = await resolveOwnerId(req.userId!);
    const dbSettings = await prisma.setting.findMany({ where: { userId } });
    const dbMap = new Map(dbSettings.map((s) => [s.key, s.value]));

    // Merge: DB takes priority, then env fallback
    const result = ALLOWED_KEYS.map((key) => {
      const dbVal = dbMap.get(key);
      const envVal = getEnvValue(key);
      const value = dbVal || envVal || '';
      const hasValue = value.length > 0;
      const source = dbVal ? 'db' : envVal ? 'env' : 'none';

      let displayValue = '';
      if (hasValue) {
        if (NON_SECRET_KEYS.includes(key)) {
          displayValue = value;
        } else {
          displayValue = value.length > 8 ? '••••••••' + value.slice(-4) : '••••';
        }
      }

      return { key, value: displayValue, hasValue, source };
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// PUT /api/settings - Update a setting
const updateSchema = z.object({
  key: z.string(),
  value: z.string(),
});

router.put('/', validate(updateSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = await resolveOwnerId(req.userId!);
    const { key, value } = req.body;

    if (!ALLOWED_KEYS.includes(key)) {
      res.status(400).json({ success: false, error: 'Key not allowed' });
      return;
    }

    await prisma.setting.upsert({
      where: { userId_key: { userId, key } },
      create: { userId, key, value },
      update: { value },
    });

    res.json({ success: true, data: { key, saved: true } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// DELETE /api/settings/:key - Remove a setting
router.delete('/:key', async (req: AuthRequest, res: Response) => {
  try {
    const userId = await resolveOwnerId(req.userId!);
    const key = req.params.key as string;

    await prisma.setting.deleteMany({ where: { userId, key } });
    res.json({ success: true, data: { key, deleted: true } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

export default router;
