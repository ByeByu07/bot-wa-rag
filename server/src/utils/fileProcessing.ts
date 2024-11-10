import { promises as fs } from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

async function processFile(fileData: Buffer | string, mimeType: string): Promise<string> {
  console.log('Processing file of type:', mimeType);

  try {
    // If fileData is Buffer, process directly
    if (Buffer.isBuffer(fileData)) {
      switch (mimeType) {
        case 'text/plain':
          return fileData.toString('utf-8');
        
        case 'application/pdf': {
          const pdfData = await pdf(fileData);
          return pdfData.text;
        }
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
          const docxResult = await mammoth.extractRawText({ buffer: fileData });
          return docxResult.value;
        }
        
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } else {
      throw new Error('Invalid file data: Expected Buffer');
    }
  } catch (error) {
    console.error('Error processing file:', error);
    throw error; // Let the caller handle cleanup
  }
}

export { processFile }; 