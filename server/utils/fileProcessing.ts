import { promises as fs } from 'fs';
import type { PDFData } from 'pdf-parse';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';

async function processFile(filePath: string): Promise<string> {
  const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';
  
  try {
    switch (fileExtension) {
      case 'txt':
        return await fs.readFile(filePath, 'utf-8');
      
      case 'pdf': {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(dataBuffer);
        return pdfData.text;
      }
      
      case 'docx': {
        const docxBuffer = await fs.readFile(filePath);
        const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
        return docxResult.value;
      }
      
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    throw new Error(`Error processing file: ${error.message}`);
  }
}

export { processFile }; 