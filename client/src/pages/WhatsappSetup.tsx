import { useState, useEffect } from 'react';
import { MessageSquare, Loader, AlertCircle } from 'lucide-react';
import api from '../utils/axios';
import { Button } from '../components/Button';

type WhatsAppStatus = 'initializing' | 'connecting' | 'ready' | 'connected' | 'error';

interface WhatsappSetupProps {
  botId: number | null;
  onClose: () => void;
  onConnect?: () => void;
}

const WhatsappSetup = ({ botId, onClose, onConnect }: WhatsappSetupProps) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState<WhatsAppStatus>('initializing');
  const [error, setError] = useState<string>('');

  const checkStatus = async () => {
    try {
      const response = await api.get(`/bots/${botId}/status`);
      if (response.data.isActive) {
        setStatus('connected');
        onConnect?.();
        setTimeout(onClose, 2000);
      }
    } catch (error: any) {
      console.error('Error checking status:', error);
      setError(error.response?.data?.error || 'Failed to check status');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeWhatsApp = async () => {
    try {
      setStatus('connecting');
      const response = await api.post(`/bots/${botId}/initialize`);
      
      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
        setStatus('ready');
      } else {
        setStatus('connected');
        setTimeout(onClose, 2000);
      }
    } catch (error: any) {
      console.error('Error initializing WhatsApp:', error);
      setStatus('error');
      setError(error.response?.data?.error || 'Failed to initialize WhatsApp');
    }
  };

  return (
    <div className="text-center">
      <MessageSquare className="mx-auto h-12 w-12 text-indigo-600" />
      <h2 className="mt-4 text-3xl font-bold text-gray-900">
        WhatsApp Setup
      </h2>
      
      {status === 'initializing' && (
        <div className="mt-8 text-center">
          <Button 
            variant="primary"
            size="lg"
            onClick={initializeWhatsApp}
          >
            Connect WhatsApp
          </Button>
        </div>
      )}

      {status === 'connecting' && (
        <div className="mt-8 text-center">
          <Loader className="animate-spin h-8 w-8 text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">
            Connecting to WhatsApp...
          </p>
        </div>
      )}

      {status === 'ready' && qrCode && (
        <div className="mt-8 text-center">
          <p className="mb-4 text-gray-600">
            Scan this QR code with WhatsApp
          </p>
          <img 
            src={qrCode} 
            alt="WhatsApp QR Code" 
            className="max-w-full mx-auto rounded-lg shadow-md" 
          />
        </div>
      )}

      {status === 'connected' && (
        <div className="mt-8 text-center">
          <div className="text-green-600 font-semibold">
            WhatsApp is connected!
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-8 text-center bg-red-50 p-4 rounded-lg">
          <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">
            {error || 'Error connecting to WhatsApp. Please try again.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default WhatsappSetup;