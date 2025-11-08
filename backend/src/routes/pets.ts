import { Router } from 'express';
import {
  createPet,
  getPet,
  getMyPets,
  markAsLost,
  markAsFound,
  updatePet,
  deletePet,
  findLostPetsNearby,
  createPetValidation,
  markLostValidation
} from '../controllers/petController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/nearby', findLostPetsNearby);
router.get('/:id', getPet);

// Protected routes
router.post('/', authenticateToken, createPetValidation, createPet);
router.get('/my/pets', authenticateToken, getMyPets);
router.post('/:id/lost', authenticateToken, markLostValidation, markAsLost);
router.post('/:id/found', authenticateToken, markAsFound);
router.put('/:id', authenticateToken, updatePet);
router.delete('/:id', authenticateToken, deletePet);

export default router;
