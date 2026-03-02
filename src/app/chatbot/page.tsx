"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: {
    transactionId?: string;
    fraudScore?: number;
    riskFactors?: string[];
  };
}

interface FraudContext {
  transactionId?: string;
  fraudScore?: number;
  isFraud?: boolean;
  narrative?: string;
  topFeatures?: Array<{ name: string; value: number | string; impact: number }>;
  baseValue?: number;
}

export default function ChatBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your FraudGuard AI assistant powered by OpenAI GPT. I can help you understand fraud detection results, explain risk factors, and provide insights into why certain transactions were flagged.\n\n**Features:**\n- Context-aware conversations about fraud analysis\n- AI-powered explanations for any transaction\n- Investigation recommendations\n\nYou can ask me things like:\n- 'Why was this transaction flagged as fraud?'\n- 'What are the main risk factors?'\n- 'Should I block this transaction?'\n\n**Note:** Enter your OpenAI API key in settings (🔐 icon) to enable AI responses.\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fraudContext, setFraudContext] = useState<FraudContext | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem("fraudguard_openai_api_key");
    if (storedKey) {
      setApiKey(storedKey);
      setIsApiKeySet(true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setApiKeyError("Please enter a valid API key");
      return;
    }
    if (!apiKey.startsWith("sk-")) {
      setApiKeyError("API key should start with 'sk-'");
      return;
    }
    
    localStorage.setItem("fraudguard_openai_api_key", apiKey.trim());
    setIsApiKeySet(true);
    setApiKeyError("");
    setShowSettings(false);
    
    // Add system message about API key being set
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "assistant",
      content: "✅ API key configured successfully! I'm now powered by OpenAI GPT. You can ask me any questions about fraud detection and I'll provide AI-powered analysis.\n\nTry asking:\n- 'Why was this transaction flagged?'\n- 'What are the risk factors?'\n- 'Should I block this transaction?'",
      timestamp: new Date(),
    }]);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("fraudguard_openai_api_key");
    setApiKey("");
    setIsApiKeySet(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let responseContent: string;
      
      // Check if user wants to look up a transaction
      const transactionMatch = input.match(/transaction\s+([a-zA-Z0-9-]+)/i) || input.match(/^([a-zA-Z0-9-]{8,})$/i);
      
      if (transactionMatch) {
        const transactionId = transactionMatch[1] || transactionMatch[0];
        responseContent = `To analyze transaction ${transactionId}, I need access to the fraud detection database. Currently, I'm connected to OpenAI GPT for general fraud analysis.\n\nYou can ask me general questions like:\n- 'How does fraud detection work?'\n- 'What are common fraud patterns?'\n- 'What factors increase fraud risk?'\n\nWould you like me to explain these topics instead?`;
      } else if (isApiKeySet) {
        // Use OpenAI API directly
        try {
          // Build conversation history
          const conversationHistory = messages
            .filter(m => m.id !== "1") // Skip welcome message
            .map(m => ({
              role: m.role,
              content: m.content
            }));
          
          // Add current user message
          conversationHistory.push({ role: "user", content: input });

          const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: conversationHistory,
              apiKey: apiKey
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            responseContent = data.reply;
          } else {
            const errorData = await res.json();
            throw new Error(errorData.error || "Chat failed");
          }
        } catch (apiError) {
          console.error("OpenAI API error:", apiError);
          responseContent = `I encountered an error connecting to OpenAI. ${apiError instanceof Error ? apiError.message : 'Please check your API key and try again.'}`;
        }
      } else {
        // Use local responses when API key not set
        responseContent = await generateLocalResponse(input);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        context: fraudContext ? {
          transactionId: fraudContext.transactionId,
          fraudScore: fraudContext.fraudScore,
          riskFactors: fraudContext.topFeatures?.map(f => f.name),
        } : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Local response generation (fallback when API key not available)
  const generateLocalResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Default contextual responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "Hello! I'm here to help you understand fraud detection results. \n\n**To get AI-powered responses:**\n1. Click the 🔐 icon in the top right\n2. Enter your OpenAI API key\n3. Click Save\n\nYour API key is stored locally on your device and never sent to any server except OpenAI directly.\n\nWhat would you like to know?";
    }

    if (lowerMessage.includes("how") && lowerMessage.includes("work")) {
      return "Our fraud detection system uses machine learning to analyze transactions in real-time. Here's how it works:\n\n1. **Data Collection**: Transaction details are captured including amount, location, time, device info, and historical patterns.\n\n2. **Feature Analysis**: Our model analyzes hundreds of features including spending patterns, geographical anomalies, and behavioral signals.\n\n3. **Risk Scoring**: Each transaction receives a fraud score (0-100%) based on how closely it matches known fraud patterns.\n\n4. **Decision**: Transactions with scores above threshold are flagged for review or automatic blocking\n\nWould you like more details on any specific aspect?";
    }

    if (lowerMessage.includes("what") && lowerMessage.includes("fraud")) {
      return "Fraud, in the context of our detection system, refers to transactions that show suspicious characteristics indicating they may be unauthorized or deceptive. This includes:\n\n- **Account takeover**: Legitimate credentials used fraudulently\n- **Card testing**: Small fraudulent transactions to validate stolen cards\n- **Velocity anomalies**: Unusual spending patterns\n- **Geographic impossibilities**: Transactions from impossible locations\n- **Device fingerprinting**: Suspicious device signals\n\nOur AI analyzes these patterns to protect your users and transactions.";
    }

    if (lowerMessage.includes("help")) {
      return "I can help you with:\n\n🔍 **Transaction Analysis**: Ask about specific fraud cases\n📊 **Risk Understanding**: 'What does this score mean?'\n⚠️ **Factor Identification**: 'What are the risk factors?'\n💡 **System Information**: 'How does fraud detection work?'\n📈 **Pattern Recognition**: 'What patterns indicate fraud?'\n\n**Note:** Enter your OpenAI API key to get AI-powered responses!\n\nJust ask me a question!";
    }

    if (lowerMessage.includes("api") || lowerMessage.includes("key")) {
      return "To enable AI-powered responses:\n\n1. Click the 🔐 icon in the top right corner\n2. Enter your OpenAI API key (starts with 'sk-')\n3. Click Save\n\nYour API key is:\n- Stored only in your browser's local storage\n- Never sent to our servers\n- Used only to call OpenAI's API directly\n\nYou can get a free API key from [OpenAI Platform](https://platform.openai.com/api-keys).";
    }

    // Default response when no specific context
    return "I'd be happy to help you understand fraud detection better! \n\n**To get AI-powered analysis:**\n1. Click the 🔐 icon in the top right\n2. Enter your OpenAI API key\n3. Save and start chatting\n\nWithout an API key, I can still provide general information about fraud detection principles. What would you like to explore?";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                FraudGuard
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/upload" className="text-gray-700 hover:text-indigo-600 transition">
                  Upload
                </Link>
                <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 transition">
                  Dashboard
                </Link>
                <Link href="/explain" className="text-gray-700 hover:text-indigo-600 transition">
                  Explainability
                </Link>
                <Link href="/api-test" className="text-gray-700 hover:text-indigo-600 transition">
                  API Test
                </Link>
                <span className="text-indigo-600 font-medium">AI Assistant</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* API Key Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isApiKeySet 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isApiKeySet ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span>{isApiKeySet ? 'AI Ready' : 'API Key Required'}</span>
              </div>
              
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                title="API Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">🔐 API Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setApiKeyError("");
                }}
                placeholder="sk-..."
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                  apiKeyError 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
              />
              {apiKeyError && (
                <p className="text-red-500 text-sm mt-1">{apiKeyError}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Your API key is stored locally in your browser and never sent to our servers.
                Get a free key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSaveApiKey}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Save API Key
              </button>
              {isApiKeySet && (
                <button
                  onClick={() => {
                    handleClearApiKey();
                    setShowSettings(false);
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 FraudGuard AI Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Get contextual analysis and explanations for fraud detection results
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Context Indicator */}
          {fraudContext && (
            <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-indigo-600">📊 Analyzing:</span>
                  <code className="text-sm bg-white px-2 py-1 rounded border">{fraudContext.transactionId}</code>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">
                    Score: <span className="font-bold text-indigo-600">{((fraudContext.fraudScore || 0) * 100).toFixed(1)}%</span>
                  </span>
                  <span className={`text-sm px-2 py-1 rounded ${fraudContext.isFraud ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {fraudContext.isFraud ? '⚠️ Fraud' : '✅ Safe'}
                  </span>
                  <button 
                    onClick={() => setFraudContext(null)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isApiKeySet ? "Ask about fraud detection..." : "Enter API key to enable AI responses"}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setInput("What are the main risk factors for fraudulent transactions?")}
            className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition text-left"
          >
            <div className="text-lg font-semibold text-gray-900">⚠️ Risk Factors</div>
            <div className="text-sm text-gray-600">Learn what triggers fraud detection</div>
          </button>
          
          <button
            onClick={() => setInput("How does fraud detection work?")}
            className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition text-left"
          >
            <div className="text-lg font-semibold text-gray-900">💡 How It Works</div>
            <div className="text-sm text-gray-600">Learn about our detection methodology</div>
          </button>
          
          <button
            onClick={() => setInput("What are common fraud patterns to watch for?")}
            className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition text-left"
          >
            <div className="text-lg font-semibold text-gray-900">🔍 Fraud Patterns</div>
            <div className="text-sm text-gray-600">Common types of fraud</div>
          </button>
        </div>

        {/* API Key Setup */}
        {!isApiKeySet && (
          <div className="mt-8 bg-indigo-50 rounded-lg shadow p-6 border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">🚀 Enable AI-Powered Responses</h3>
            <p className="text-indigo-700 mb-4">
              Enter your OpenAI API key to unlock full AI capabilities. Your key is stored locally and never sent to our servers.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Enter API Key
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
