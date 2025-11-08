import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SightingModel } from '../models/Sighting';
import { body, validationResult } from 'express-validator';
import axios from 'axios';

export const createSightingValidation = [
  body('photo').notEmpty().trim(),
  body('description').optional().trim(),
  body('location.latitude').isFloat({ min: -90, max: 90 }),
  body('location.longitude').isFloat({ min: -180, max: 180 }),
  body('location_address').optional().trim(),
  body('pet_id').optional().isInt()
];

export const createSighting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const reporterId = req.user ? req.user.userId : null;
    const sighting = await SightingModel.create(reporterId, req.body);

    // If pet_id is provided, trigger AI matching
    if (req.body.pet_id) {
      // Trigger AI matching asynchronously (don't wait for result)
      triggerAIMatching(sighting.id, req.body.pet_id).catch(err => {
        console.error('AI matching error:', err);
      });
    }

    res.status(201).json({
      message: 'Sighting reported successfully',
      sighting
    });
  } catch (error) {
    console.error('Create sighting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSighting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sightingId = parseInt(req.params.id);
    const sighting = await SightingModel.findById(sightingId);

    if (!sighting) {
      res.status(404).json({ error: 'Sighting not found' });
      return;
    }

    res.json({ sighting });
  } catch (error) {
    console.error('Get sighting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSightingsByPet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const petId = parseInt(req.params.petId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const sightings = await SightingModel.findByPetId(petId, limit);

    res.json({ sightings });
  } catch (error) {
    console.error('Get sightings by pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSightingsNearby = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      res.status(400).json({ error: 'Latitude and longitude are required' });
      return;
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const radiusMiles = radius ? parseFloat(radius as string) : 5;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const sightings = await SightingModel.findNearby(lat, lon, radiusMiles, limit);

    res.json({ sightings });
  } catch (error) {
    console.error('Get sightings nearby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const confirmSighting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const sightingId = parseInt(req.params.id);
    const sighting = await SightingModel.confirm(sightingId, req.user.userId);

    res.json({
      message: 'Sighting confirmed',
      sighting
    });
  } catch (error) {
    console.error('Confirm sighting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to trigger AI matching
async function triggerAIMatching(sightingId: number, petId: number): Promise<void> {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiServiceUrl}/api/match`, {
      sighting_id: sightingId,
      pet_id: petId
    });

    if (response.data.confidence) {
      await SightingModel.updateAIConfidence(sightingId, response.data.confidence);
    }
  } catch (error) {
    console.error('AI matching service error:', error);
    throw error;
  }
}
