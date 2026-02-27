"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:5000";

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
      content: "Hello! I'm your FraudGuard AI assistant. I can help you understand fraud detection results, explain risk factors, and provide insights into why certain transactions were flagged. You can ask me things like:\n\n- 'Why was transaction X flagged as fraud?'\n- 'What are the main risk factors?'\n- 'Explain the fraud score for transaction Y'\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fraudContext, setFraudContext] = useState<FraudContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // If we have fraud context, provide contextual responses
    if (fraudContext) {
      if (lowerMessage.includes("why") || lowerMessage.includes("explain")) {
        if (fraudContext.narrative) {
          return `Based on the analysis of transaction ${fraudContext.transactionId || 'in question'}:\n\n${fraudContext.narrative}\n\n**Key Risk Factors:**\n${fraudContext.topFeatures?.slice(0, 3).map((f, i) => `${i + 1}. ${f.name}: ${f.impact > 0 ? 'increased' : 'decreased'} risk by ${Math.abs(f.impact).toFixed(1)}%`).join('\n') || 'No specific factors identified'}\n\nThe fraud score of ${((fraudContext.fraudScore || 0) * 100).toFixed(1)}% indicates ${fraudContext.isFraud ? 'a high likelihood of fraudulent activity' : 'some suspicious patterns that warrant attention'}.`;
        }
      }
      
      if (lowerMessage.includes("score") || lowerMessage.includes("confidence")) {
        return `The fraud score for this transaction is ${((fraudContext.fraudScore || 0) * 100).toFixed(1)}%.\n\nThis score is calculated using our machine learning model and represents the probability that this transaction is fraudulent. Here's how we interpret this:\n\n- **80-100%**: High fraud risk - immediate action recommended\n- **50-79%**: Medium fraud risk - review recommended\n- **20-49%**: Low fraud risk - monitor if needed\n- **0-19%**: Minimal risk - likely legitimate\n\nCurrent risk level: **${fraudContext.isFraud ? 'HIGH' : 'MEDIUM/LOW'}**`;
      }

      if (lowerMessage.includes("feature") || lowerMessage.includes("factor") || lowerMessage.includes("reason")) {
        if (fraudContext.topFeatures && fraudContext.topFeatures.length > 0) {
          return `The main factors contributing to this fraud analysis are:\n\n${fraudContext.topFeatures.map((f, i) => {
            const impactDesc = f.impact > 0 ? 'increases' : 'decreases';
            const riskLevel = f.impact > 5 ? 'significantly' : f.impact > 2 ? 'moderately' : 'slightly';
            return `**${i + 1}. ${f.name}**: Value "${f.value}" ${impactDesc} fraud risk by ${riskLevel} (${Math.abs(f.impact).toFixed(2)}%)`;
          }).join('\n\n')}`;
        }
      }

      if (lowerMessage.includes("transaction") || lowerMessage.includes("details")) {
        return `Here's the detailed breakdown for transaction ${fraudContext.transactionId || 'in question'}:\n\n**Fraud Score**: ${((fraudContext.fraudScore || 0) * 100).toFixed(1)}%\n**Classification**: ${fraudContext.isFraud ? '⚠️ Flagged as Fraud' : '✅ Not Flagged'}\n**Base Rate**: ${(fraudContext.baseValue ? fraudContext.baseValue * 100 : 50).toFixed(1)}%\n\n${fraudContext.narrative ? `**Analysis**: ${fraudContext.narrative}` : ''}`;
      }
    }

    // Default contextual responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "Hello! I'm here to help you understand fraud detection results. You can ask me to explain specific transactions, risk factors, or how our detection system works. What would you like to know?";
    }

    if (lowerMessage.includes("how") && lowerMessage.includes("work")) {
      return "Our fraud detection system uses machine learning to analyze transactions in real-time. Here's how it works:\n\n1. **Data Collection**: Transaction details are captured including amount, location, time, device info, and historical patterns.\n\n2. **Feature Analysis**: Our model analyzes hundreds of features including spending patterns, geographical anomalies, and behavioral signals.\n\n3. **Risk Scoring**: Each transaction receives a fraud score (0-100%) based on how closely it matches known fraud patterns.\n\n4. **Decision**: Transactions with scores above threshold are flagged for review or automatic blocking.\n\nWould you like more details on any specific aspect?";
    }

    if (lowerMessage.includes("what") && lowerMessage.includes("fraud")) {
      return "Fraud, in the context of our detection system, refers to transactions that show suspicious characteristics indicating they may be unauthorized or deceptive. This includes:\n\n- **Account takeover**: Legitimate credentials used fraudulently\n- **Card testing**: Small fraudulent transactions to validate stolen cards\n- **Velocity anomalies**: Unusual spending patterns\n- **Geographic impossibilities**: Transactions from impossible locations\n- **Device fingerprinting**: Suspicious device signals\n\nOur AI analyzes these patterns to protect your users and transactions.";
    }

    if (lowerMessage.includes("help")) {
      return "I can help you with:\n\n🔍 **Transaction Analysis**: 'Explain transaction ABC123'\n📊 **Risk Understanding**: 'What does this score mean?'\n⚠️ **Factor Identification**: 'What are the risk factors?'\n💡 **System Information**: 'How does fraud detection work?'\n📈 **Pattern Recognition**: 'What patterns indicate fraud?'\n\nJust ask me a question!";
    }

    // Default response when no specific context
    return "I'd be happy to help you understand fraud detection better! To provide specific analysis, you can either:\n\n1. **Enter a transaction ID** in the form below to load specific fraud analysis\n2. **Ask general questions** about how fraud detection works\n\nWhat would you like to explore?";
  };

  const handleTransactionLookup = async (transactionId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${ML_API_URL}/explain/${transactionId}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      if (res.ok) {
        const data = await res.json();
        setFraudContext(data);
        return `I've loaded the analysis for transaction ${transactionId}. The fraud score is ${((data.fraud_score || 0) * 100).toFixed(1)}% and it was ${data.is_fraud ? 'flagged as fraud' : 'not flagged'}. You can now ask me specific questions about this transaction!`;
      } else {
        return `I couldn't find transaction ${transactionId}. It may not exist in the system yet, or there might be an issue with the database. Would you like to try a different transaction ID?`;
      }
    } catch (error) {
      return `I'm having trouble accessing the fraud detection system right now. The ML service may be temporarily unavailable. Please try again later or check if the transaction ID is correct.`;
    } finally {
      setIsLoading(false);
    }
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
      // Check if user wants to look up a transaction
      const transactionMatch = input.match(/transaction\s+([a-zA-Z0-9-]+)/i) || input.match(/^([a-zA-Z0-9-]{8,})$/i);
      
      let responseContent: string;
      if (transactionMatch) {
        const transactionId = transactionMatch[1] || transactionMatch[0];
        responseContent = await handleTransactionLookup(transactionId);
      } else {
        responseContent = await generateResponse(input);
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
          </div>
        </div>
      </nav>

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
                placeholder="Ask about fraud detection, enter transaction ID, or ask for help..."
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
            onClick={() => setInput("Explain the fraud score for this transaction")}
            className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition text-left"
          >
            <div className="text-lg font-semibold text-gray-900">📊 Score Explanation</div>
            <div className="text-sm text-gray-600">Understand what the fraud score means</div>
          </button>
          
          <button
            onClick={() => setInput("What are the main risk factors?")}
            className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition text-left"
          >
            <div className="text-lg font-semibold text-gray-900">⚠️ Risk Factors</div>
            <div className="text-sm text-gray-600">See what triggered the fraud detection</div>
          </button>
          
          <button
            onClick={() => setInput("How does fraud detection work?")}
            className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition text-left"
          >
            <div className="text-lg font-semibold text-gray-900">💡 How It Works</div>
            <div className="text-sm text-gray-600">Learn about our detection methodology</div>
          </button>
        </div>

        {/* Example Questions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Example Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              onClick={() => setInput("Why was this transaction flagged as fraud?")}
              className="text-left text-sm text-indigo-600 hover:text-indigo-800"
            >
              → Why was this transaction flagged as fraud?
            </button>
            <button 
              onClick={() => setInput("What does a 75% fraud score mean?")}
              className="text-left text-sm text-indigo-600 hover:text-indigo-800"
            >
              → What does a 75% fraud score mean?
            </button>
            <button 
              onClick={() => setInput("Show me the key risk factors")}
              className="text-left text-sm text-indigo-600 hover:text-indigo-800"
            >
              → Show me the key risk factors
            </button>
            <button 
              onClick={() => setInput("How accurate is the fraud detection?")}
              className="text-left text-sm text-indigo-600 hover:text-indigo-800"
            >
              → How accurate is the fraud detection?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
