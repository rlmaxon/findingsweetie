import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { User } from '../types';

export class UserModel {
  static async create(email: string, password: string, firstName?: string, lastName?: string, phone?: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, phone, created_at, updated_at, is_active, email_verified
    `;

    const values = [email, passwordHash, firstName, lastName, phone];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(userId: number): Promise<User | null> {
    const query = `
      SELECT id, email, first_name, last_name, phone, created_at, updated_at, is_active, email_verified
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    const user = result.rows[0];

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  static async updateProfile(userId: number, updates: { first_name?: string; last_name?: string; phone?: string }): Promise<User> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.first_name !== undefined) {
      setClause.push(`first_name = $${paramCount}`);
      values.push(updates.first_name);
      paramCount++;
    }

    if (updates.last_name !== undefined) {
      setClause.push(`last_name = $${paramCount}`);
      values.push(updates.last_name);
      paramCount++;
    }

    if (updates.phone !== undefined) {
      setClause.push(`phone = $${paramCount}`);
      values.push(updates.phone);
      paramCount++;
    }

    setClause.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone, created_at, updated_at, is_active, email_verified
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async verifyEmail(userId: number): Promise<User> {
    const query = `
      UPDATE users
      SET email_verified = TRUE, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, first_name, last_name, phone, created_at, updated_at, is_active, email_verified
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}
