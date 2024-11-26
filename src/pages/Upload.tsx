import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FileText, MessageSquare, Clock, Trash2, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { interviewApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import ResumeUploader from '../components/ResumeUploader';
import Button from '../components/Button';

interface ChatSession {
  id: string;
  timestamp: string;
  messageCount: number;
  lastMessage: string;
  resumePreview: string;
}

export default function Upload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    // Load existing chat sessions from localStorage
    const loadSessions = () => {
      const allSessions: ChatSession[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('chat_session_')) {
          const sessionId = key.replace('chat_session_', '');
          const messages = JSON.parse(localStorage.getItem(`chat_${sessionId}`) || '[]');
          const resume = localStorage.getItem(`resume_${sessionId}`) || '';
          
          if (messages.length > 0) {
            allSessions.push({
              id: sessionId,
              timestamp: messages[messages.length - 1].timestamp,
              messageCount: messages.length,
              lastMessage: messages[messages.length - 1].question,
              resumePreview: resume.slice(0, 100) + '...'
            });
          }
        }
      }
      setSessions(allSessions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    };

    loadSessions();
  }, []);

  const handleUpload = useCallback(async (content: string) => {
    try {
      setLoading(true);
      const response = await interviewApi.uploadResume(content);
      localStorage.setItem('session_id', response.session_id);
      localStorage.setItem(`resume_${response.session_id}`, content);
      localStorage.setItem(`chat_session_${response.session_id}`, new Date().toISOString());
      toast.success('Resume uploaded successfully');
      navigate('/interview');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload resume';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleContinueSession = (sessionId: string) => {
    localStorage.setItem('session_id', sessionId);
    navigate('/interview');
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat history?')) {
      localStorage.removeItem(`chat_${sessionId}`);
      localStorage.removeItem(`resume_${sessionId}`);
      localStorage.removeItem(`chat_session_${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Chat history deleted');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Interview Preparation
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Upload your resume or continue a previous interview session
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New Chat Section */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Start New Interview
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              {showNewChat ? (
                <ResumeUploader onUpload={handleUpload} />
              ) : (
                <div className="text-center">
                  <Button
                    onClick={() => setShowNewChat(true)}
                    icon={<Plus className="w-4 h-4" />}
                    size="lg"
                  >
                    New Interview Session
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Previous Chats Section */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Previous Sessions
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No previous sessions found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Upload a resume to start your first interview
                    </p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleContinueSession(session.id)}
                      className="group relative p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(session.timestamp), 'PPp')}
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                            {session.messageCount} messages
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100"
                          icon={<Trash2 className="w-4 h-4" />}
                        >
                          Delete
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {session.resumePreview}
                      </p>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}