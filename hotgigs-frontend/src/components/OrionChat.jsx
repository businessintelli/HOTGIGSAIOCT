import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, X, Minimize2, Maximize2, RotateCcw } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function OrionChat({ isOpen, onClose, minimized, onToggleMinimize }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: "👋 Hi! I'm Orion, your AI career copilot. I'm here to help you with:\n\n• Career guidance and advice\n• Interview preparation\n• Resume optimization tips\n• Job fit analysis\n• Skill development recommendations\n• Salary negotiation strategies\n\nHow can I assist you today?",
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.post('/ai/orion/chat', {
        message: inputMessage,
        conversation_history: conversationHistory,
        user_context: {
          user_id: user?.id,
          email: user?.email,
          role: user?.role
        }
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationHistory(response.data.conversation_history || []);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    if (confirm('Are you sure you want to clear this conversation?')) {
      setMessages([{
        role: 'assistant',
        content: "Conversation cleared. How can I help you today?",
        timestamp: new Date()
      }]);
      setConversationHistory([]);
    }
  };

  const quickPrompts = [
    "Help me prepare for a technical interview",
    "Review my career path",
    "How do I negotiate salary?",
    "What skills should I learn next?",
    "Analyze this job opportunity for me"
  ];

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40" 
        onClick={onClose}
      />

      {/* Chat Window */}
      <div className={`fixed right-6 bg-white rounded-lg shadow-2xl z-50 flex flex-col transition-all ${
        minimized 
          ? 'bottom-6 w-80 h-16' 
          : 'bottom-6 w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                Orion AI Copilot
                <Sparkles className="w-4 h-4" />
              </h3>
              {!minimized && (
                <p className="text-xs text-blue-100">Your 24/7 career guide</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMinimize}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              {minimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-blue-600' 
                      : message.isError 
                        ? 'bg-red-500' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div className={`inline-block max-w-[85%] px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isError
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-gray-200 bg-white">
                <p className="text-xs text-gray-500 mb-2">Quick prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.slice(0, 3).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex gap-2">
                <button
                  onClick={clearConversation}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Orion anything..."
                    rows="1"
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || loading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

