import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PetModel } from '../models/Pet';
import { body, param, validationResult } from 'express-validator';

export const createPetValidation = [
  body('name').notEmpty().trim(),
  body('breed').optional().trim(),
  body('color').optional().trim(),
  body('age').optional().isInt({ min: 0 }),
  body('microchip').optional().trim(),
  body('description').optional().trim(),
  body('pet_type').optional().isIn(['dog', 'cat', 'bird', 'other'])
];

export const markLostValidation = [
  body('last_seen_date').isISO8601(),
  body('last_seen_location.latitude').isFloat({ min: -90, max: 90 }),
  body('last_seen_location.longitude').isFloat({ min: -180, max: 180 }),
  body('last_seen_address').optional().trim(),
  body('search_radius_miles').optional().isFloat({ min: 0.1, max: 100 })
];

export const createPet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const pet = await PetModel.create(req.user.userId, req.body);

    res.status(201).json({
      message: 'Pet registered successfully',
      pet
    });
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const petId = parseInt(req.params.id);
    const pet = await PetModel.findById(petId);

    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    res.json({ pet });
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyPets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const pets = await PetModel.findByOwnerId(req.user.userId);

    res.json({ pets });
  } catch (error) {
    console.error('Get my pets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsLost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const petId = parseInt(req.params.id);
    const pet = await PetModel.findById(petId);

    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    if (pet.owner_id !== req.user.userId) {
      res.status(403).json({ error: 'You can only mark your own pets as lost' });
      return;
    }

    const updatedPet = await PetModel.markAsLost(petId, req.body);

    res.json({
      message: 'Pet marked as lost',
      pet: updatedPet
    });
  } catch (error) {
    console.error('Mark as lost error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsFound = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const petId = parseInt(req.params.id);
    const pet = await PetModel.findById(petId);

    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    if (pet.owner_id !== req.user.userId) {
      res.status(403).json({ error: 'You can only mark your own pets as found' });
      return;
    }

    const updatedPet = await PetModel.markAsFound(petId);

    res.json({
      message: 'Pet marked as found!',
      pet: updatedPet
    });
  } catch (error) {
    console.error('Mark as found error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const petId = parseInt(req.params.id);
    const pet = await PetModel.findById(petId);

    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    if (pet.owner_id !== req.user.userId) {
      res.status(403).json({ error: 'You can only update your own pets' });
      return;
    }

    const updatedPet = await PetModel.update(petId, req.body);

    res.json({
      message: 'Pet updated successfully',
      pet: updatedPet
    });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const petId = parseInt(req.params.id);
    const pet = await PetModel.findById(petId);

    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    if (pet.owner_id !== req.user.userId) {
      res.status(403).json({ error: 'You can only delete your own pets' });
      return;
    }

    await PetModel.delete(petId);

    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadPetPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const petId = parseInt(req.params.id);
    const pet = await PetModel.findById(petId);

    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    if (pet.owner_id !== req.user.userId) {
      res.status(403).json({ error: 'You can only add photos to your own pets' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const newPhotoUrls = files.map(f => `/uploads/${f.filename}`);
    const existingPhotos: string[] = Array.isArray(pet.photos) ? pet.photos : [];
    const allPhotos = [...existingPhotos, ...newPhotoUrls].slice(0, 10);

    const updatedPet = await PetModel.update(petId, { photos: allPhotos });

    res.json({
      message: 'Photos uploaded successfully',
      photos: newPhotoUrls,
      pet: updatedPet
    });
  } catch (error) {
    console.error('Upload pet photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const findLostPetsNearby = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      res.status(400).json({ error: 'Latitude and longitude are required' });
      return;
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const radiusMiles = radius ? parseFloat(radius as string) : 10;

    const lostPets = await PetModel.findLostPetsNearby(lat, lon, radiusMiles);

    res.json({ lostPets });
  } catch (error) {
    console.error('Find lost pets nearby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
