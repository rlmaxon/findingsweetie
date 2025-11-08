import { Router } from 'express';
import { generatePetQR, trackShare, getShareAnalytics } from '../controllers/shareController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/pets/:id/qr', generatePetQR);
router.post('/share/track', authenticateToken, trackShare);
router.get('/share/analytics/:id', authenticateToken, getShareAnalytics);

export default router;
