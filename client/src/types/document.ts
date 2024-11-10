export interface Document {
  _id: string;
  fileName: string;
  metadata: {
    uploadDate: string;
    userId: string;
    size: number;
    type: string;
  };
} 