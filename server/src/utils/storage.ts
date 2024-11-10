import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '../config/r2.config';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export const uploadToR2 = async (file: Express.Multer.File, userId: string) => {
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const key = `uploads/${userId}/${fileName}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return {
    fileName,
    key,
    url: `${process.env.R2_PUBLIC_URL}/${key}`
  };
}; 