import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { QRService } from '../services/qrService';
import pool from '../config/database';

export const generatePetQR = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const petId = parseInt(req.params.id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

    const qrCodeDataUrl = await QRService.generatePetProfileQR(petId, frontendUrl);

    res.json({
      qrCode: qrCodeDataUrl,
      profileUrl: `${frontendUrl}/pets/${petId}`,
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

export const trackShare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { petId, platform, shareUrl } = req.body;

    const query = `
      INSERT INTO social_shares (pet_id, user_id, platform, share_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [petId, req.user.userId, platform, shareUrl || null]);

    res.json({
      message: 'Share tracked successfully',
      share: result.rows[0],
    });
  } catch (error) {
    console.error('Track share error:', error);
    res.status(500).json({ error: 'Failed to track share' });
  }
};

export const getShareAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const petId = parseInt(req.params.id);

    const query = `
      SELECT
        platform,
        COUNT(*) as share_count,
        MAX(shared_at) as last_shared
      FROM social_shares
      WHERE pet_id = $1
      GROUP BY platform
      ORDER BY share_count DESC
    `;

    const result = await pool.query(query, [petId]);

    res.json({
      analytics: result.rows,
    });
  } catch (error) {
    console.error('Get share analytics error:', error);
    res.status(500).json({ error: 'Failed to get share analytics' });
  }
};
