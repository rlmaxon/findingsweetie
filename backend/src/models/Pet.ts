import pool from '../config/database';
import { Pet, CreatePetRequest, MarkLostRequest } from '../types';

export class PetModel {
  static async create(userId: number, petData: CreatePetRequest): Promise<Pet> {
    const { name, breed, color, age, microchip, description, pet_type, photos } = petData;

    const query = `
      INSERT INTO pets (owner_id, name, breed, color, age, microchip, description, pet_type, photos)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [userId, name, breed, color, age, microchip, description, pet_type || 'dog', photos || []];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  static async findById(petId: number): Promise<Pet | null> {
    const query = `
      SELECT
        id, owner_id, name, breed, color, age, microchip, description,
        ST_AsGeoJSON(last_seen)::json as last_seen,
        last_seen_address, last_seen_date, is_lost, search_radius_miles,
        photos, created_at, updated_at, found_at, pet_type
      FROM pets
      WHERE id = $1
    `;

    const result = await pool.query(query, [petId]);
    return result.rows[0] || null;
  }

  static async findByOwnerId(ownerId: number): Promise<Pet[]> {
    const query = `
      SELECT
        id, owner_id, name, breed, color, age, microchip, description,
        ST_AsGeoJSON(last_seen)::json as last_seen,
        last_seen_address, last_seen_date, is_lost, search_radius_miles,
        photos, created_at, updated_at, found_at, pet_type
      FROM pets
      WHERE owner_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [ownerId]);
    return result.rows;
  }

  static async markAsLost(petId: number, lostData: MarkLostRequest): Promise<Pet> {
    const { last_seen_date, last_seen_location, last_seen_address, search_radius_miles } = lostData;

    const query = `
      UPDATE pets
      SET
        is_lost = TRUE,
        last_seen = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        last_seen_date = $3,
        last_seen_address = $4,
        search_radius_miles = COALESCE($5, search_radius_miles),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      last_seen_location.longitude,
      last_seen_location.latitude,
      last_seen_date,
      last_seen_address,
      search_radius_miles,
      petId
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async markAsFound(petId: number): Promise<Pet> {
    const query = `
      UPDATE pets
      SET
        is_lost = FALSE,
        found_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [petId]);
    return result.rows[0];
  }

  static async findLostPetsNearby(latitude: number, longitude: number, radiusMiles: number = 10): Promise<any[]> {
    const query = `
      SELECT * FROM find_lost_pets_nearby(
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
    `;

    const result = await pool.query(query, [longitude, latitude, radiusMiles]);
    return result.rows;
  }

  static async update(petId: number, updates: Partial<CreatePetRequest>): Promise<Pet> {
    const allowedFields = ['name', 'breed', 'color', 'age', 'microchip', 'description', 'pet_type'];
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key as keyof CreatePetRequest]);
        paramCount++;
      }
    });

    setClause.push(`updated_at = NOW()`);
    values.push(petId);

    const query = `
      UPDATE pets
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(petId: number): Promise<boolean> {
    const query = 'DELETE FROM pets WHERE id = $1';
    const result = await pool.query(query, [petId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async addPhoto(petId: number, photoUrl: string): Promise<Pet> {
    const query = `
      UPDATE pets
      SET photos = array_append(photos, $1),
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [photoUrl, petId]);
    return result.rows[0];
  }
}
