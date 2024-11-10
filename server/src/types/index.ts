export interface User {
  _id: string;
  email: string;
  password: string;
  businessName: string;
  businessFiles: BusinessFile[];
  whatsappNumber?: string;
  isWhatsappActive: boolean;
}

export interface BusinessFile {
  fileName: string;
  content: string;
  uploadDate: Date;
}

export interface Document {
  _id: string;
  userId: string;
  fileName: string;
  fileType: string;
  content: string;
  vectorId?: string;
  metadata: {
    uploadDate: Date;
    fileSize?: number;
    processingStatus: string;
  };
} 