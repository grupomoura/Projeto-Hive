import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  analyzeVideo,
  getVideoClip,
  listVideoClips,
  cutClips,
  deleteVideoClip,
} from '../controllers/video.controller';

const router = Router();

const analyzeSchema = z.object({
  url: z.string().url(),
  whisperModel: z.enum(['tiny', 'base', 'small', 'medium', 'large']).optional().default('tiny'),
  maxMoments: z.number().int().min(1).max(50).optional().default(10),
  language: z.string().max(5).optional(),
});

const cutSchema = z.object({
  clips: z.array(z.object({
    start: z.number(),
    end: z.number(),
    title: z.string().optional(),
  })).min(1),
  format: z.enum(['vertical', 'square', 'horizontal']).optional().default('vertical'),
  burnSubs: z.boolean().optional().default(false),
  whisperModel: z.enum(['tiny', 'base', 'small', 'medium', 'large']).optional().default('tiny'),
  language: z.string().max(5).optional(),
});

router.use(authMiddleware);

router.post('/', validate(analyzeSchema), analyzeVideo);
router.get('/', listVideoClips);
router.get('/:id', getVideoClip);
router.post('/:id/cut', validate(cutSchema), cutClips);
router.delete('/:id', deleteVideoClip);

export default router;
