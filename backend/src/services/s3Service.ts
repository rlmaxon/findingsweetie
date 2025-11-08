import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'findingsweetie-uploads';

export class S3Service {
  static async uploadImage(buffer: Buffer, mimeType: string, folder: string = 'pets'): Promise<string> {
    const key = `${folder}/${uuidv4()}.${mimeType.split('/')[1]}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  }

  static async deleteImage(url: string): Promise<void> {
    const key = url.split('.com/')[1];

    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
  }

  static getSignedUrl(key: string, expiresIn: number = 3600): string {
    return s3.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    });
  }
}
