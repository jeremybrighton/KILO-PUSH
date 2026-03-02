import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required. Please enter your API key in the settings.' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Initialize OpenAI with user's API key
    const openai = new OpenAI({
      apiKey: apiKey.trim()
    });

    // Fraud detection system prompt
    const systemMessage = {
      role: 'system',
      content: `You are FraudGuard AI, an expert fraud detection analyst assistant. Your role is to help users understand and analyze fraud detection results from a financial transaction monitoring system.

You have deep knowledge of:
- Fraud detection patterns and techniques
- Risk factors in financial transactions
- Machine learning models used for fraud detection
- SHAP explanations and feature importance
- PCI DSS compliance and security best practices

When explaining fraud decisions:
1. Be clear and concise in your explanations
2. Use professional financial terminology appropriately
3. Explain risk factors in plain language
4. Provide actionable insights when possible
5. Never suggest bypassing security controls

Always maintain a professional, security-conscious tone.`
    };

    // Build messages array with system prompt
    const chatMessages = [systemMessage, ...messages];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const reply = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenAI API key.' },
          { status: 401 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to connect to AI service. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}

// Validate API key endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ready',
    message: 'Chat API is ready. Provide your OpenAI API key to use the chatbot.' 
  });
}
