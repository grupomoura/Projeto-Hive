import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createPost,
  listPosts,
  getPost,
  updatePost,
  deletePost,
  publishPost,
  schedulePostController,
} from '../controllers/post.controller';

const router = Router();

const createPostSchema = z.object({
  caption: z.string().max(2200).optional(),
  imageUrl: z.string().url().optional(),
  imageSource: z.enum(['NANOBANA', 'UPLOAD', 'URL']).optional(),
  nanoPrompt: z.string().optional(),
  source: z.enum(['WEB', 'TELEGRAM', 'MCP']).optional(),
  hashtags: z.array(z.string()).optional(),
  aspectRatio: z.string().optional(),
});

const scheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

router.use(authMiddleware);

router.post('/', validate(createPostSchema), createPost);
router.get('/', listPosts);
router.get('/:id', getPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/publish', publishPost);
router.post('/:id/schedule', validate(scheduleSchema), schedulePostController);

export default router;
