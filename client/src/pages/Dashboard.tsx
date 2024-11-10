import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Trash2, 
  MessageSquare, 
  FileText,
  Plus,
  AlertCircle,
  Power
} from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/Button';
import { Document } from '../types/document';
import { config } from '../config/env.config';
import WhatsappSetup from './WhatsappSetup';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Bot {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  lastActive?: Date;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string>('');
  const [bots, setBots] = useState<Bot[]>([]);
  const [showNewBotModal, setShowNewBotModal] = useState(false);
  const [newBotData, setNewBotData] = useState({ name: '', description: '' });
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [botDocuments, setBotDocuments] = useState<Document[]>([]);

  const { isAuthenticated, logout, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate, isAuthenticated]);

  useEffect(() => {
    fetchBots();
    if (selectedBot?._id) {
      fetchBotDocuments(selectedBot._id);
    }
  }, [selectedBot?._id]);

  const fetchBots = async () => {
    try {
      const response = await axios.get<Bot[]>(`${config.serverApiUrl}/api/bots`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBots(response.data);
    } catch (error) {
      setError('Failed to fetch bots');
    }
  };

  const fetchBotDocuments = async (botId: string) => {
    try {
      const response = await axios.get<Document[]>(
        `${config.serverApiUrl}/api/bots/${botId}/documents`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setBotDocuments(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch bot documents');
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!e.target.files?.length || !selectedBot?._id) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(
        `${config.serverApiUrl}/api/bots/${selectedBot._id}/documents/upload`, 
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Refresh bot documents
      fetchBotDocuments(selectedBot._id);
    } catch (error) {
      console.error(error);
      setError('Failed to upload file');
    }
  };

  const handleDeleteDocument = async (documentId: string): Promise<void> => {
    if (!selectedBot?._id) return;
    
    try {
      await axios.delete(
        `${config.serverApiUrl}/api/bots/${selectedBot._id}/documents/${documentId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      fetchBotDocuments(selectedBot._id);
    } catch (error) {
      setError('Failed to delete document');
    }
  };

  const handleCreateBot = async () => {
    try {
      const response = await axios.post(
        `${config.serverApiUrl}/api/bots`,
        newBotData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setBots([...bots, response.data]);
      setShowNewBotModal(false);
      setNewBotData({ name: '', description: '' });
      toast.success('Bot created successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create bot';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDisconnectBot = async (botId: string): Promise<void> => {
    try {
      await axios.post(
        `${config.serverApiUrl}/api/bots/${botId}/disconnect`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      // Refresh the bots list to show updated status
      fetchBots();
      toast.success('Bot disconnected successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to disconnect bot';
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const handleDeleteBot = async (botId: string): Promise<void> => {
    try {
      await axios.delete(`${config.serverApiUrl}/api/bots/${botId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Remove the deleted bot from the state
      setBots(bots.filter(bot => bot._id !== botId));
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete bot');
    }
  };

  const handleAssignDocumentToBot = async (documentId: string) => {
    if (!selectedBot) return;
    
    try {
      await axios.post(
        `${config.serverApiUrl}/api/bots/${selectedBot._id}/documents`,
        { documentIds: [documentId] },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      fetchBotDocuments(selectedBot._id);
    } catch (error) {
      setError('Failed to assign document to bot');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Toaster position="top-center" />
      {/* Navbar - WhatsApp setup button removed */}
      <div className="bg-white shadow p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome Back, {user?.businessName}</span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-sm bg-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Bot List */}
        <div className="w-1/3 max-w-xs border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Bots</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNewBotModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Bot
              </Button>
            </div>

            <ul className="space-y-4">
              {bots.map((bot) => (
                <li 
                  key={bot._id} 
                  className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                    selectedBot?._id === bot._id ? 'border-indigo-500 ring-2 ring-indigo-200' : ''
                  }`}
                  onClick={() => setSelectedBot(bot)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <div 
                          className={`w-2.5 h-2.5 rounded-full ${bot.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                        />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {bot.isActive ? 'Bot is active' : 'Bot is inactive'}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{bot.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <MessageSquare 
                          className={`h-5 w-5 ${
                            bot.isActive 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-gray-600 hover:text-indigo-600 cursor-pointer'
                          } transition-colors`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (bot.isActive) {
                              toast.error('This bot is already connected to WhatsApp');
                              return;
                            }
                            
                            setSelectedBotId(bot._id);
                            setIsWhatsAppModalOpen(true);
                          }}
                        />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Setup WhatsApp
                        </span>
                      </div>

                      <div className="relative group">
                        <Power 
                          className={`h-5 w-5 cursor-pointer transition-colors ${
                            bot.isActive 
                              ? 'text-green-500 hover:text-green-700' 
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (bot.isActive) {
                              handleDisconnectBot(bot._id);
                            } else {
                              toast.error('Bot is not connected');
                            }
                          }}
                        />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {bot.isActive ? "Disconnect from WhatsApp" : "Bot is not connected"}
                        </span>
                      </div>

                      <div className="relative group">
                        <Trash2 
                          className="h-5 w-5 text-red-500 hover:text-red-700 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBot(bot._id);
                          }}
                        />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Delete this bot
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {bot.description && (
                    <p className="text-sm text-gray-500 mt-2">{bot.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* New Bot Modal */}
          {showNewBotModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Create New Bot</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={newBotData.name}
                      onChange={(e) => setNewBotData({ ...newBotData, name: e.target.value })}
                      className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea
                      value={newBotData.description}
                      onChange={(e) => setNewBotData({ ...newBotData, description: e.target.value })}
                      className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewBotModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreateBot}>Create Bot</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Content - Documents */}
        <div className="w-2/3 flex-1 overflow-y-auto">
          <div className="p-4">
            {!selectedBot ? (
              <div className="text-center py-8">
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  Select a bot to manage its documents
                </h3>
              </div>
            ) : (
              <>
                {/* Document Controls */}
                <div className="mb-4 flex items-center gap-3">
                  <Button variant="primary">
                    <label className="cursor-pointer flex items-center">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Document to {selectedBot.name}
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </Button>
                </div>

                {/* Documents List */}
                <div className="bg-white shadow rounded-lg">
                  {botDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-base font-medium text-gray-900 mb-1">
                        No documents yet
                      </h3>
                      <p className="text-sm text-gray-500">
                        Upload your first document to {selectedBot.name}
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {botDocuments.map((doc) => (
                        <li key={doc._id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {doc.fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(doc.metadata.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDocument(doc._id)}
                            className="text-gray-400 bg-white hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Setup Modal */}
      {isWhatsAppModalOpen && selectedBotId && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsWhatsAppModalOpen(false);
            }
          }}
        >
          <div 
            className="bg-white p-6 rounded-lg max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Add close button */}
            <button
              onClick={() => setIsWhatsAppModalOpen(false)}
              className="absolute bg-white top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <WhatsappSetup
              botId={selectedBotId}
              onClose={() => setIsWhatsAppModalOpen(false)}
              onConnect={() => {
                fetchBots();
                setIsWhatsAppModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 