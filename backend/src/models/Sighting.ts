import pool from '../config/database';
import { Sighting, CreateSightingRequest } from '../types';

export class SightingModel {
  static async create(reporterId: number | null, sightingData: CreateSightingRequest): Promise<Sighting> {
    const { pet_id, photo, description, location, location_address } = sightingData;

    const query = `
      INSERT INTO sightings (pet_id, reporter_id, photo, description, location, location_address)
      VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, $7)
      RETURNING
        id, pet_id, reporter_id, photo, description,
        ST_AsGeoJSON(location)::json as location,
        location_address, created_at, ai_confidence, is_confirmed,
        confirmed_at, confirmed_by, metadata
    `;

    const values = [
      pet_id || null,
      reporterId,
      photo,
      description,
      location.longitude,
      location.latitude,
      location_address
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(sightingId: number): Promise<Sighting | null> {
    const query = `
      SELECT
        id, pet_id, reporter_id, photo, description,
        ST_AsGeoJSON(location)::json as location,
        location_address, created_at, ai_confidence, is_confirmed,
        confirmed_at, confirmed_by, metadata
      FROM sightings
      WHERE id = $1
    `;

    const result = await pool.query(query, [sightingId]);
    return result.rows[0] || null;
  }

  static async findByPetId(petId: number, limit: number = 50): Promise<Sighting[]> {
    const query = `
      SELECT
        id, pet_id, reporter_id, photo, description,
        ST_AsGeoJSON(location)::json as location,
        location_address, created_at, ai_confidence, is_confirmed,
        confirmed_at, confirmed_by, metadata
      FROM sightings
      WHERE pet_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [petId, limit]);
    return result.rows;
  }

  static async findNearby(latitude: number, longitude: number, radiusMiles: number = 5, limit: number = 50): Promise<any[]> {
    const query = `
      SELECT
        s.id, s.pet_id, s.reporter_id, s.photo, s.description,
        ST_AsGeoJSON(s.location)::json as location,
        s.location_address, s.created_at, s.ai_confidence, s.is_confirmed,
        ST_Distance(s.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1609.34 as distance_miles
      FROM sightings s
      WHERE ST_DWithin(s.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3 * 1609.34)
      ORDER BY distance_miles ASC
      LIMIT $4
    `;

    const result = await pool.query(query, [longitude, latitude, radiusMiles, limit]);
    return result.rows;
  }

  static async updateAIConfidence(sightingId: number, confidence: number): Promise<Sighting> {
    const query = `
      UPDATE sightings
      SET ai_confidence = $1
      WHERE id = $2
      RETURNING
        id, pet_id, reporter_id, photo, description,
        ST_AsGeoJSON(location)::json as location,
        location_address, created_at, ai_confidence, is_confirmed,
        confirmed_at, confirmed_by, metadata
    `;

    const result = await pool.query(query, [confidence, sightingId]);
    return result.rows[0];
  }

  static async confirm(sightingId: number, confirmedBy: number): Promise<Sighting> {
    const query = `
      UPDATE sightings
      SET
        is_confirmed = TRUE,
        confirmed_at = NOW(),
        confirmed_by = $1
      WHERE id = $2
      RETURNING
        id, pet_id, reporter_id, photo, description,
        ST_AsGeoJSON(location)::json as location,
        location_address, created_at, ai_confidence, is_confirmed,
        confirmed_at, confirmed_by, metadata
    `;

    const result = await pool.query(query, [confirmedBy, sightingId]);
    return result.rows[0];
  }

  static async findUnmatchedSightings(limit: number = 100): Promise<Sighting[]> {
    const query = `
      SELECT
        id, pet_id, reporter_id, photo, description,
        ST_AsGeoJSON(location)::json as location,
        location_address, created_at, ai_confidence, is_confirmed,
        confirmed_at, confirmed_by, metadata
      FROM sightings
      WHERE pet_id IS NULL
      ORDER BY created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async assignToPet(sightingId: number, petId: number): Promise<Sighting> {
    const query = `
      UPDATE sightings
      SET pet_id = $1
      WHERE id = $2
      RETURNING
        id, pet_id, reporter_id, photo, description,
        ST_AsGeoJSON(location)::json as location,
        location_address, created_at, ai_confidence, is_confirmed,
        confirmed_at, confirmed_by, metadata
    `;

    const result = await pool.query(query, [petId, sightingId]);
    return result.rows[0];
  }
}
