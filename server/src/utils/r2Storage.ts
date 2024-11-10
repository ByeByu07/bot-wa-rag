import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '../config/r2.config';

export const deleteFromR2 = async (key: string): Promise<void> => {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw error;
  }
}; 