import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FileText, ArrowLeft, LogOut, Download, Settings, Sparkles } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import ThemeToggle from '../components/ThemeToggle';
import { interviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  question: string;
  response: string;
  timestamp: string;
}

interface Settings {
  autoScroll: boolean;
  showTimestamps: boolean;
  fontSize: 'sm' | 'base' | 'lg';
}

export default function Interview() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resumeContent, setResumeContent] = useState('');
  const [showResume, setShowResume] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    autoScroll: true,
    showTimestamps: true,
    fontSize: 'base'
  });
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    const savedMessages = localStorage.getItem(`chat_${sessionId}`);
    const savedResume = localStorage.getItem(`resume_${sessionId}`);
    const savedSettings = localStorage.getItem('interview_settings');

    if (!sessionId || !savedResume) {
      navigate('/upload');
      return;
    }

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    if (savedResume) {
      setResumeContent(savedResume);
    }
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [navigate]);

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    if (messages.length > 0) {
      localStorage.setItem(`chat_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('interview_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSendMessage = async (question: string) => {
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      navigate('/upload');
      return;
    }

    try {
      const response = await interviewApi.getAnswer(question, sessionId);
      const newMessage = { 
        question, 
        response: response.response,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, newMessage]);
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get response';
      toast.error(message);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(messages.length - 1, prev + 1));
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      setCurrentIndex(0);
      const sessionId = localStorage.getItem('session_id');
      if (sessionId) {
        localStorage.removeItem(`chat_${sessionId}`);
        interviewApi.clearConversation(sessionId);
      }
      toast.success('Chat history cleared');
    }
  };

  const handleBackToUpload = () => {
    if (messages.length > 0) {
      if (window.confirm('Going back will allow you to upload a new resume. Continue?')) {
        navigate('/upload');
      }
    } else {
      navigate('/upload');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? Your session will be saved.')) {
      logout();
      navigate('/login');
    }
  };

  const handleSaveChat = async () => {
    setIsSaving(true);
    try {
      const chatContent = messages.map(m => `Q: ${m.question}\nA: ${m.response}\n`).join('\n');
      const blob = new Blob([chatContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-chat-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Chat saved successfully');
    } catch (error) {
      toast.error('Failed to save chat');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImproveAnswer = async () => {
    if (messages.length === 0) {
      toast.error('No answers to improve yet');
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const sessionId = localStorage.getItem('session_id');
    
    if (!sessionId) {
      navigate('/upload');
      return;
    }

    try {
      const response = await interviewApi.getAnswer(
        `Please improve my previous answer to "${lastMessage.question}" with more specific details and examples. Make it more comprehensive while keeping the conversational tone.`,
        sessionId
      );
      
      const newMessage = {
        question: `Improved answer for: ${lastMessage.question}`,
        response: response.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages((prev) => [...prev, newMessage]);
      setCurrentIndex(messages.length);
      toast.success('Generated improved answer');
    } catch (error) {
      toast.error('Failed to generate improved answer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToUpload}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Upload New Resume
            </button>
            <button
              onClick={() => setShowResume(!showResume)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              {showResume ? 'Hide Resume' : 'Show Resume'}
            </button>
            {messages.length > 0 && (
              <button
                onClick={handleImproveAnswer}
                className="inline-flex items-center px-4 py-2 border border-indigo-500 rounded-md shadow-sm text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-dark-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Improve Last Answer
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {messages.length > 0 && (
              <button
                onClick={handleSaveChat}
                disabled={isSaving}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Save Chat
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Settings className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mb-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Chat Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.autoScroll}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoScroll: e.target.checked }))}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Auto-scroll to new messages</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.showTimestamps}
                  onChange={(e) => setSettings(prev => ({ ...prev, showTimestamps: e.target.checked }))}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show message timestamps</span>
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Font size:</span>
                <select
                  value={settings.fontSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value as Settings['fontSize'] }))}
                  className="rounded border-gray-300 text-gray-700 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="sm">Small</option>
                  <option value="base">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {showResume && (
            <div className="w-1/3">
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 h-[calc(100vh-12rem)] overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Your Resume</h3>
                <div className={`whitespace-pre-wrap text-${settings.fontSize} text-gray-600 dark:text-gray-300`}>
                  {resumeContent}
                </div>
              </div>
            </div>
          )}
          
          <div className={showResume ? 'w-2/3' : 'w-full'}>
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg h-[calc(100vh-12rem)]">
              <ChatInterface
                messages={messages}
                onSend={handleSendMessage}
                onPrevious={handlePrevious}
                onNext={handleNext}
                currentIndex={currentIndex}
                onClear={handleClearChat}
                settings={settings}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}