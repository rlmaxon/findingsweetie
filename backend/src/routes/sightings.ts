import { Router } from 'express';
import {
  createSighting,
  getSighting,
  getSightingsByPet,
  getSightingsNearby,
  confirmSighting,
  createSightingValidation
} from '../controllers/sightingController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Public/optional auth routes
router.post('/', optionalAuth, createSightingValidation, createSighting);
router.get('/nearby', getSightingsNearby);
router.get('/:id', getSighting);
router.get('/pet/:petId', getSightingsByPet);

// Protected routes
router.post('/:id/confirm', authenticateToken, confirmSighting);

export default router;
