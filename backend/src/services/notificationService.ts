import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { NotificationModel } from '../models/Notification';

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export class NotificationService {
  static async sendEmail(
    userId: number,
    to: string,
    subject: string,
    message: string,
    petId?: number,
    sightingId?: number
  ): Promise<boolean> {
    try {
      // Create notification record
      const notification = await NotificationModel.create(
        userId,
        message,
        'email',
        petId,
        sightingId
      );

      // Send email
      await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@findingsweetie.com',
        to,
        subject,
        html: message
      });

      // Mark as sent
      await NotificationModel.markAsSent(notification.id);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  static async sendSMS(
    userId: number,
    to: string,
    message: string,
    petId?: number,
    sightingId?: number
  ): Promise<boolean> {
    try {
      if (!twilioClient) {
        console.warn('Twilio not configured, skipping SMS');
        return false;
      }

      // Create notification record
      const notification = await NotificationModel.create(
        userId,
        message,
        'sms',
        petId,
        sightingId
      );

      // Send SMS
      await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
        body: message
      });

      // Mark as sent
      await NotificationModel.markAsSent(notification.id);
      return true;
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }

  static async notifyPetOwnerOfSighting(
    ownerId: number,
    ownerEmail: string,
    ownerPhone: string | null,
    petName: string,
    sightingLocation: string,
    confidence: number,
    petId: number,
    sightingId: number
  ): Promise<void> {
    const emailMessage = `
      <h2>Possible Sighting of ${petName}</h2>
      <p>We've detected a possible sighting of your pet ${petName}!</p>
      <p><strong>Location:</strong> ${sightingLocation}</p>
      <p><strong>Confidence:</strong> ${(confidence * 100).toFixed(1)}%</p>
      <p>Please log in to FindingSweetie to view the full details and confirm the sighting.</p>
      <p><a href="${process.env.FRONTEND_URL}/pets/${petId}/sightings/${sightingId}">View Sighting</a></p>
    `;

    const smsMessage = `FindingSweetie: Possible sighting of ${petName} detected at ${sightingLocation} with ${(confidence * 100).toFixed(0)}% confidence. Check your account for details.`;

    // Send both email and SMS
    await Promise.all([
      this.sendEmail(ownerId, ownerEmail, `Possible Sighting of ${petName}`, emailMessage, petId, sightingId),
      ownerPhone ? this.sendSMS(ownerId, ownerPhone, smsMessage, petId, sightingId) : Promise.resolve(false)
    ]);
  }
}
