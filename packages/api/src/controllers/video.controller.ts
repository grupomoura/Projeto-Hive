import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import { resolveOwnerId } from '../helpers/resolveOwnerId';
import { queueAnalysis, queueClipping } from '../services/video.service';

export async function analyzeVideo(req: AuthRequest, res: Response) {
  try {
    const userId = await resolveOwnerId(req.userId!);
    const { url, whisperModel, maxMoments, language } = req.body;

    const videoClip = await prisma.videoClip.create({
      data: { sourceUrl: url, userId },
    });

    await queueAnalysis(videoClip.id, { whisperModel, maxMoments, language });

    res.json({
      success: true,
      data: { id: videoClip.id, status: 'PENDING', message: 'Analise iniciada em background' },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
}

export async function getVideoClip(req: AuthRequest, res: Response) {
  try {
    const userId = await resolveOwnerId(req.userId!);
    const id = req.params.id as string;

    const videoClip = await prisma.videoClip.findFirst({
      where: { id, userId },
    });

    if (!videoClip) {
      res.status(404).json({ success: false, error: 'Video clip not found' });
      return;
    }

    res.json({ success: true, data: videoClip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
}

export async function listVideoClips(req: AuthRequest, res: Response) {
  try {
    const userId = await resolveOwnerId(req.userId!);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string;

    const where: any = { userId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.videoClip.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.videoClip.count({ where }),
    ]);

    res.json({ success: true, data: { items, total, page, limit } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
}

export async function cutClips(req: AuthRequest, res: Response) {
  try {
    const userId = await resolveOwnerId(req.userId!);
    const id = req.params.id as string;
    const { clips, format, burnSubs, whisperModel, language } = req.body;

    const videoClip = await prisma.videoClip.findFirst({
      where: { id, userId },
    });

    if (!videoClip) {
      res.status(404).json({ success: false, error: 'Video clip not found' });
      return;
    }

    if (videoClip.status !== 'ANALYZED') {
      res.status(400).json({ success: false, error: 'Video must be analyzed first' });
      return;
    }

    await queueClipping(id, clips, { format, burnSubs, whisperModel, language });

    res.json({
      success: true,
      data: { id, status: 'CLIPPING', message: 'Corte iniciado em background' },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
}

export async function deleteVideoClip(req: AuthRequest, res: Response) {
  try {
    const userId = await resolveOwnerId(req.userId!);
    const id = req.params.id as string;

    const videoClip = await prisma.videoClip.findFirst({
      where: { id, userId },
    });

    if (!videoClip) {
      res.status(404).json({ success: false, error: 'Video clip not found' });
      return;
    }

    await prisma.videoClip.delete({ where: { id } });
    res.json({ success: true, data: { message: 'Video clip excluido' } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
}
