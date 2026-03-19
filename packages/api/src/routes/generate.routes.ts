import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { generateImageController, generateCaptionController } from '../controllers/generate.controller';

const router = Router();

const imageSchema = z.object({
  prompt: z.string().min(1),
  style: z.string().optional(),
  aspectRatio: z.enum(['1:1', '9:16', '4:5']).optional(),
});

const captionSchema = z.object({
  topic: z.string().min(1),
  tone: z.enum(['educativo', 'inspirador', 'humor', 'noticia']).optional(),
  hashtagsCount: z.number().min(1).max(30).optional(),
  language: z.string().optional(),
  maxLength: z.number().max(2200).optional(),
});

router.use(authMiddleware);

router.post('/image', validate(imageSchema), generateImageController);
router.post('/caption', validate(captionSchema), generateCaptionController);

export default router;
