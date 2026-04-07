import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  listDesignSystems,
  getDesignSystem,
  getCategories,
  suggestBrandFromInspirations,
  TOTAL_DESIGN_SYSTEMS,
  DesignSystemCategory,
} from '../services/design-systems';

const router = Router();
router.use(authMiddleware);

// GET /api/design-systems - list all (with optional filters)
router.get('/', (req: AuthRequest, res: Response) => {
  const category = req.query.category as DesignSystemCategory | undefined;
  const search = req.query.search as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const items = listDesignSystems({ category, search, limit });
  res.json({
    success: true,
    data: { items, total: items.length, totalAvailable: TOTAL_DESIGN_SYSTEMS },
  });
});

// GET /api/design-systems/categories - list categories with counts
router.get('/categories', (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: getCategories() });
});

// GET /api/design-systems/:id - get one
router.get('/:id', (req: AuthRequest, res: Response) => {
  const ds = getDesignSystem(req.params.id as string);
  if (!ds) {
    res.status(404).json({ success: false, error: 'Design system not found' });
    return;
  }
  res.json({ success: true, data: ds });
});

// POST /api/design-systems/suggest - suggest a brand from inspirations
const suggestSchema = z.object({
  inspirationIds: z.array(z.string()).min(1).max(5),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
});

router.post('/suggest', validate(suggestSchema), (req: AuthRequest, res: Response) => {
  const { inspirationIds, businessName, businessType } = req.body;
  const suggestion = suggestBrandFromInspirations(inspirationIds, { businessName, businessType });
  if (!suggestion) {
    res.status(400).json({ success: false, error: 'No valid inspirations found' });
    return;
  }
  res.json({ success: true, data: suggestion });
});

export default router;
