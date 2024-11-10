import { promises as fs } from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

async function processFile(filePath: string, mimeType: string): Promise<string> {
  console.log('Processing file:', filePath);
  console.log('Mime type:', mimeType);

  try {
    switch (mimeType) {
      case 'text/plain':
        return await fs.readFile(filePath, 'utf-8');
      
      case 'application/pdf': {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(dataBuffer);
        return pdfData.text;
      }
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        const docxBuffer = await fs.readFile(filePath);
        const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
        return docxResult.value;
      }
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error processing file:', error);
    // Clean up the file
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error deleting file:', unlinkError);
    }
    throw new Error(`Error processing file: ${error.message}`);
  }
}

export { processFile }; 