'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

interface ChatHistory {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  messages: Message[];
}

const STORAGE_KEY = 'chatbot_history';

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newChatName, setNewChatName] = useState('');
  const [showNewChatInput, setShowNewChatInput] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isPCSidebarOpen, setIsPCSidebarOpen] = useState(true);

  // Load chat histories from localStorage on component mount
  useEffect(() => {
    const savedHistories = localStorage.getItem(STORAGE_KEY);
    if (savedHistories) {
      const parsedHistories = JSON.parse(savedHistories);
      setChatHistories(parsedHistories);
    } else {
      // Initialize with default chats if no saved histories
      const defaultHistories: ChatHistory[] = [
        { 
          id: '1', 
          name: 'Waleed', 
          lastMessage: 'Hello, how can you help me?', 
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          }), 
          messages: [
            { role: 'user', content: 'Hello, how can you help me?', id: '1-1' },
            { role: 'assistant', content: 'Hello! I\'m here to help you with any questions or tasks you might have. What can I assist you with today?', id: '1-2' }
          ] 
        },
        { 
          id: '2', 
          name: 'Rohan', 
          lastMessage: 'What is the weather?', 
          timestamp: '', 
          messages: [
            { role: 'user', content: 'What is the weather?', id: '2-1' },
            { role: 'assistant', content: 'I don\'t have access to real-time weather data. However, I can help you understand weather concepts or suggest weather-related APIs you could use in your applications.', id: '2-2' }
          ] 
        },
        { 
          id: '3', 
          name: 'Talal', 
          lastMessage: 'Tell me about AI', 
          timestamp: '', 
          messages: [
            { role: 'user', content: 'Tell me about AI', id: '3-1' },
            { role: 'assistant', content: 'Artificial Intelligence (AI) is a broad field that involves creating computer systems that can perform tasks that typically require human intelligence. This includes learning, reasoning, problem-solving, understanding natural language, and perception. Would you like to know more about any specific aspect of AI?', id: '3-2' }
          ] 
        },
        { 
          id: '4', 
          name: 'Hamza', 
          lastMessage: 'How to code?', 
          timestamp: '', 
          messages: [
            { role: 'user', content: 'How to code?', id: '4-1' },
            { role: 'assistant', content: 'Coding is a skill that can be learned through practice and dedication. Here are some steps to get started:\n1. Choose a programming language (Python, JavaScript, Java, etc.)\n2. Learn the basics (variables, loops, functions)\n3. Practice with small projects\n4. Use online resources and tutorials\n5. Join coding communities\nWould you like to focus on a specific programming language or topic?', id: '4-2' }
          ] 
        },
        { 
          id: '5', 
          name: 'Danial', 
          lastMessage: 'What is React?', 
          timestamp: '', 
          messages: [
            { role: 'user', content: 'What is React?', id: '5-1' },
            { role: 'assistant', content: 'React is a JavaScript library for building user interfaces, particularly single-page applications. It\'s used for handling the view layer and allows you to create reusable UI components. React uses a virtual DOM to efficiently update and render components when data changes. Would you like to learn more about specific React concepts?', id: '5-2' }
          ] 
        },
      ];
      setChatHistories(defaultHistories);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultHistories));
    }
  }, []);

  // Save chat histories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistories));
  }, [chatHistories]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent chat selection when clicking delete
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setChatHistories(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChat === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message and its response?')) {
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      
      setMessages(prev => prev.filter((msg, index) => 
        index !== messageIndex && index !== messageIndex + 1
      ));
      
      if (activeChat) {
        setChatHistories(prev => prev.map(chat => 
          chat.id === activeChat 
            ? { 
                ...chat, 
                messages: chat.messages.filter((msg, index) => 
                  index !== messageIndex && index !== messageIndex + 1
                ),
                lastMessage: chat.messages[messageIndex - 1]?.content || '',
                timestamp: chat.messages.length > 0 
                  ? new Date().toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })
                  : chat.timestamp
              }
            : chat
        ));
      }
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setInput(message.content);
  };

  const handleUpdateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !editingMessage) return;

    const updatedMessage: Message = {
      ...editingMessage,
      content: input.trim()
    };

    setMessages(prev => prev.map(msg => 
      msg.id === editingMessage.id ? updatedMessage : msg
    ));

    if (activeChat) {
      setChatHistories(prev => prev.map(chat => 
        chat.id === activeChat 
          ? { 
              ...chat, 
              messages: chat.messages.map(msg => 
                msg.id === editingMessage.id ? updatedMessage : msg
              )
            }
          : chat
      ));
    }

    setEditingMessage(null);
    setInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (editingMessage) {
      handleUpdateMessage(e);
      return;
    }

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      id: Date.now().toString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://backend-nine-amber-67.vercel.app/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          message: input,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        const fallbackMessage: Message = {
          role: 'assistant',
          content: 'I\'m having trouble processing your request right now. Could you please try rephrasing your question or ask something else?',
          id: Date.now().toString()
        };
        setMessages(prev => [...prev, fallbackMessage]);
        return;
      }

      const data = await response.json();

      if (!data || !data.reply) {
        const fallbackMessage: Message = {
          role: 'assistant',
          content: 'I\'m not sure how to answer that question. Could you please try asking it in a different way?',
          id: Date.now().toString()
        };
        setMessages(prev => [...prev, fallbackMessage]);
        return;
      }

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.reply,
        id: (Date.now() + 1).toString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (activeChat) {
        setChatHistories(prev => prev.map(chat => 
          chat.id === activeChat 
            ? { 
                ...chat, 
                lastMessage: input,
                timestamp: new Date().toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                }),
                messages: [...chat.messages, userMessage, assistantMessage]
              }
            : chat
        ));
      }
    } catch {
      const fallbackMessage: Message = {
        role: 'assistant',
        content: 'I\'m having trouble understanding your question. Could you please try asking it in a different way?',
        id: Date.now().toString()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
    const selectedChat = chatHistories.find(chat => chat.id === chatId);
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
    setShowSidebar(false);
  };

  const handleNewChat = () => {
    if (!newChatName.trim()) return;
    
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      name: newChatName,
      lastMessage: '',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }),
      messages: []
    };

    setChatHistories(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setMessages([]);
    setNewChatName('');
    setShowNewChatInput(false);
  };

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-teal-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sidebar - improved mobile handling */}
      <div className={`
        fixed inset-y-0 left-0 w-[85%] sm:w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/50 
        dark:border-gray-700/50 transform transition-all duration-300 ease-in-out z-30
        ${showSidebar ? 'translate-x-0 shadow-lg' : '-translate-x-full'}
        sm:absolute sm:shadow-none ${isPCSidebarOpen ? 'sm:translate-x-0' : 'sm:-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                Chat History
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
                      setChatHistories([]);
                      setActiveChat(null);
                      setMessages([]);
                      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowNewChatInput(!showNewChatInput)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            {showNewChatInput && (
              <div className="space-y-4 animate-slide-down">
                <div className="relative">
                  <input
                    type="text"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    placeholder="Enter chat name..."
                    className="w-full p-4 bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white text-sm transition-all duration-200"
                  />
                  {newChatName.trim() && (
                    <button
                      onClick={() => setNewChatName('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowNewChatInput(false);
                      setNewChatName('');
                    }}
                    className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-[1.02]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNewChat}
                    disabled={!newChatName.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-indigo-500 text-white rounded-xl hover:from-teal-600 hover:to-indigo-600 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    Create Chat
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chatHistories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-indigo-100 dark:from-teal-900 dark:to-indigo-900 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">No chats yet. Start a new conversation!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100/50 dark:divide-gray-700/50">
                {chatHistories.map((chat, index) => (
                  <div
                    key={chat.id}
                    className="group relative"
                  >
                    <button
                      onClick={() => handleChatSelect(chat.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                        activeChat === chat.id ? 'bg-teal-50/50 dark:bg-teal-900/20' : ''
                      } animate-slide-in`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-xl transition-transform duration-200 hover:scale-110">
                          {chat.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">{chat.name}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                              {chat.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{chat.lastMessage}</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area - improved responsive layout */}
      <div className="w-full flex flex-col h-screen">
        <div className={`
          flex flex-col h-full w-full transition-all duration-300
          ${isPCSidebarOpen ? 'sm:pl-80' : ''}
        `}>
          {/* Header - improved mobile design */}
          <header className="flex-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
            <div className={`
              px-4 py-3 sm:px-6 sm:py-4 
              ${isPCSidebarOpen ? 'max-w-[1024px] mx-auto' : 'container mx-auto'}
            `}>
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Mobile menu button - improved touch target */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="sm:hidden p-2.5 -ml-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* PC sidebar toggle button - improved hover states */}
                <button
                  onClick={() => setIsPCSidebarOpen(!isPCSidebarOpen)}
                  className="hidden sm:block p-2.5 -ml-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
                >
                  <svg 
                    className="w-6 h-6 text-gray-600 dark:text-gray-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {isPCSidebarOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    )}
                  </svg>
                </button>

                {/* Logo - adjusted sizes for mobile */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>

                {/* Title - responsive text sizes */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                    AI Chatbot
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Powered by Gemini • Ask me anything
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Messages container - improved spacing */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className={`
              flex-1 overflow-y-auto py-4 sm:py-6 space-y-4 sm:space-y-6 custom-scrollbar overscroll-contain
              ${isPCSidebarOpen ? 'px-4 sm:px-6 max-w-[1024px] mx-auto w-full' : 'container mx-auto px-3 sm:px-6'}
            `}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-indigo-100 dark:from-teal-900 dark:to-indigo-900 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-12 h-12 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Start a conversation!</p>
                    <p className="text-base text-gray-500 dark:text-gray-400 mt-2">Ask me anything and I&apos;ll help you out.</p>
                  </div>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={`${message.id}-${index}`}
                  className={`group relative flex items-start gap-3 sm:gap-4 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar - adjusted size for mobile */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-teal-500 to-teal-600' 
                      : 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                  }`}>
                    {message.role === 'user' ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>

                  {/* Message actions for user messages */}
                  {message.role === 'user' && (
                    <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEditMessage(message)}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Message bubble - improved padding */}
                  <div className={`
                    inline-block rounded-2xl px-3 py-2 sm:px-4 sm:py-3
                    ${message.role === 'user'
                      ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'}
                    shadow-sm animate-fade-in
                  `}>
                    <div className="text-sm sm:text-base whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input form - improved mobile design */}
          <div className="flex-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
            <div className={`p-3 sm:p-4 ${isPCSidebarOpen ? 'max-w-[1024px] mx-auto' : 'container mx-auto px-3 sm:px-6'}`}>
              <form onSubmit={editingMessage ? handleUpdateMessage : handleSubmit} className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={editingMessage ? "Edit your message..." : "Type your message..."}
                  className="flex-1 p-3 sm:p-4 text-sm sm:text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white shadow-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-teal-500 to-indigo-500 text-white rounded-xl hover:from-teal-600 hover:to-indigo-600 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <span className="text-sm sm:text-base">{editingMessage ? 'Update' : 'Send'}</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay - improved blur effect */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 sm:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <style jsx global>{`
        body {
          overscroll-behavior: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          @media (min-width: 640px) {
            width: 6px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #0d9488;
          border-radius: 2px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}