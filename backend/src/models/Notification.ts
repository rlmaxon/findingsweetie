import pool from '../config/database';
import { Notification } from '../types';

export class NotificationModel {
  static async create(
    userId: number,
    message: string,
    deliveryMethod: 'email' | 'sms' | 'push',
    petId?: number,
    sightingId?: number,
    metadata?: any
  ): Promise<Notification> {
    const query = `
      INSERT INTO notifications (user_id, pet_id, sighting_id, message, delivery_method, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [userId, petId || null, sightingId || null, message, deliveryMethod, metadata || null];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  static async findByUserId(userId: number, limit: number = 50): Promise<Notification[]> {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY sent_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  static async markAsSent(notificationId: number): Promise<Notification> {
    const query = `
      UPDATE notifications
      SET delivery_status = 'sent'
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [notificationId]);
    return result.rows[0];
  }

  static async markAsFailed(notificationId: number): Promise<Notification> {
    const query = `
      UPDATE notifications
      SET delivery_status = 'failed'
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [notificationId]);
    return result.rows[0];
  }

  static async markAsRead(notificationId: number): Promise<Notification> {
    const query = `
      UPDATE notifications
      SET read_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [notificationId]);
    return result.rows[0];
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND read_at IS NULL
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
}
