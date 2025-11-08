import QRCode from 'qrcode';

export class QRService {
  static async generateQRCode(data: string): Promise<string> {
    try {
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static async generatePetProfileQR(petId: number, frontendUrl: string): Promise<string> {
    const profileUrl = `${frontendUrl}/pets/${petId}`;
    return this.generateQRCode(profileUrl);
  }

  static async generateQRCodeBuffer(data: string): Promise<Buffer> {
    try {
      const buffer = await QRCode.toBuffer(data, {
        width: 300,
        margin: 2,
      });

      return buffer;
    } catch (error) {
      console.error('QR code buffer generation error:', error);
      throw new Error('Failed to generate QR code buffer');
    }
  }
}
