import { Request, Response } from 'express';
import { uploadImage } from '../services/storage.service';

export async function uploadImageController(req: Request, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400).json({ success: false, error: 'Invalid file type' });
      return;
    }

    if (req.file.size > 10 * 1024 * 1024) {
      res.status(400).json({ success: false, error: 'File too large (max 10MB)' });
      return;
    }

    const imageUrl = await uploadImage(req.file.buffer, req.file.mimetype);
    res.json({ success: true, data: { imageUrl } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to upload image' });
  }
}
