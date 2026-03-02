"""
PHASE 7 — AI Explainer Service
Uses OpenAI GPT to generate human-readable fraud explanations.
Integrates with the fraud detection pipeline to provide contextual insights.

Architecture:
  Fraud Detection → AI Explainer → Human-readable explanation
  Admin Chat → AI Chat → Contextual response

Requirements:
  pip install openai

Environment variables:
  OPENAI_API_KEY=your-api-key-here
  OPENAI_MODEL=gpt-4o-mini (default)
"""

import os
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "500"))
OPENAI_TIMEOUT = int(os.getenv("OPENAI_TIMEOUT", "30"))


# ── Professional Fraud Detection Prompt Template ──
FRAUD_EXPLANATION_SYSTEM_PROMPT = """You are a senior fraud risk analyst working in a financial institution with 15+ years of experience in detecting financial crimes and protecting assets.

Your role is to:
1. Analyze transaction data and fraud probability scores
2. Explain WHY a transaction might be fraudulent in clear, professional language
3. Identify suspicious patterns and behavioral anomalies
4. Provide actionable insights for fraud investigation teams

Guidelines:
- Use professional tone suitable for financial sector compliance
- Explain technical concepts in plain language
- Focus on specific transaction attributes that raised the risk score
- Do not speculate beyond the provided data
- Keep explanations concise but informative (under 150 words)
- If data is limited, explain what additional information would help
"""


def build_fraud_explanation_prompt(
    transaction_data: Dict[str, Any],
    fraud_score: float,
    risk_factors: Optional[List[Dict[str, Any]]] = None
) -> str:
    """
    Build a professional prompt for fraud explanation.
    
    Args:
        transaction_data: Dictionary with transaction details
        fraud_score: Fraud probability score (0.0 to 1.0)
        risk_factors: Optional list of SHAP risk factors
    
    Returns:
        Formatted prompt string for OpenAI
    """
    # Format transaction data
    tx_details = _format_transaction_data(transaction_data)
    
    # Format risk factors if available
    factors_text = ""
    if risk_factors:
        factors_text = "\n\nTop Risk Factors (from ML model):\n"
        for i, factor in enumerate(risk_factors[:5], 1):
            factors_text += f"{i}. {factor.get('name', 'Unknown')}: {factor.get('value', 'N/A')} "
            factors_text += f"(impact: {factor.get('impact', 0):+.3f})\n"
    
    # Determine risk level
    if fraud_score >= 0.7:
        risk_level = "HIGH RISK"
    elif fraud_score >= 0.5:
        risk_level = "MEDIUM RISK"
    else:
        risk_level = "LOW RISK"
    
    prompt = f"""Analyze this transaction and provide a fraud risk assessment:

Transaction Details:
{tx_details}

Fraud Probability Score: {fraud_score:.1%} ({risk_level})
{factors_text}

Please provide:
1. A brief summary of why this transaction was flagged (or not flagged)
2. Key suspicious indicators (if any)
3. Recommended action for the fraud investigation team

Response Format:
Summary: [2-3 sentences]
Key Indicators: [bullet points]
Recommendation: [Allow/Review/Block]
"""
    
    return prompt


def _format_transaction_data(transaction_data: Dict[str, Any]) -> str:
    """Format transaction data into readable text."""
    lines = []
    for key, value in transaction_data.items():
        if value is not None and value != "":
            # Format key as readable text
            readable_key = key.replace("_", " ").title()
            lines.append(f"- {readable_key}: {value}")
    return "\n".join(lines) if lines else "No transaction details available"


# ── Chatbot System Prompt ──
CHATBOT_SYSTEM_PROMPT = """You are FraudGuard AI Assistant, an expert fraud detection advisor.

You help users:
- Understand fraud detection results and explanations
- Investigate suspicious transactions
- Learn about fraud patterns and prevention
- Make informed decisions about flagged transactions

Guidelines:
- Be helpful, professional, and concise
- Always base answers on provided data
- If you don't have enough information, ask for clarification
- Suggest specific actions when appropriate
- Never reveal internal system details or credentials

You have access to:
- Transaction data and fraud scores
- SHAP feature importance values
- Historical fraud patterns
- Risk assessment guidelines
"""


def build_chat_prompt(
    question: str,
    context: Optional[Dict[str, Any]] = None,
    transaction_data: Optional[Dict[str, Any]] = None
) -> List[Dict[str, str]]:
    """
    Build messages for chatbot conversation.
    
    Args:
        question: User's question
        context: Optional conversation context
        transaction_data: Optional transaction details for context
    
    Returns:
        List of message dicts for OpenAI
    """
    messages = [
        {"role": "system", "content": CHATBOT_SYSTEM_PROMPT}
    ]
    
    # Add transaction context if provided
    if transaction_data:
        tx_summary = _format_transaction_data(transaction_data)
        messages.append({
            "role": "system", 
            "content": f"Current transaction context:\n{tx_summary}"
        })
    
    # Add previous conversation context if available
    if context and "history" in context:
        for msg in context["history"][-5:]:  # Last 5 messages
            messages.append(msg)
    
    # Add current question
    messages.append({"role": "user", "content": question})
    
    return messages


class AIExplainerService:
    """
    Service for generating AI-powered fraud explanations.
    Uses OpenAI API with proper error handling and fallbacks.
    """
    
    def __init__(self):
        self.client = None
        self.api_key = OPENAI_API_KEY
        self.model = OPENAI_MODEL
        self.temperature = OPENAI_TEMPERATURE
        self.max_tokens = OPENAI_MAX_TOKENS
        self.timeout = OPENAI_TIMEOUT
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize OpenAI client."""
        if not self.api_key:
            logger.warning(
                "OpenAI API key not configured. "
                "Set OPENAI_API_KEY environment variable for AI explanations."
            )
            return
        
        try:
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(
                api_key=self.api_key,
                timeout=self.timeout,
                max_retries=3
            )
            logger.info(f"OpenAI client initialized with model: {self.model}")
        except ImportError:
            logger.error("OpenAI package not installed. Run: pip install openai")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
    
    async def generate_fraud_explanation(
        self,
        transaction_data: Dict[str, Any],
        fraud_score: float,
        risk_factors: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered fraud explanation.
        
        Args:
            transaction_data: Transaction details
            fraud_score: Fraud probability score
            risk_factors: Optional SHAP risk factors
        
        Returns:
            Dict with explanation, risk level, and recommendation
        """
        # Check if OpenAI is configured
        if not self.client:
            return self._fallback_explanation(fraud_score)
        
        try:
            prompt = build_fraud_explanation_prompt(
                transaction_data,
                fraud_score,
                risk_factors
            )
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": FRAUD_EXPLANATION_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            explanation = response.choices[0].message.content
            
            # Parse the response to extract structured data
            return self._parse_explanation_response(explanation, fraud_score)
        
        except Exception as e:
            logger.error(f"OpenAI explanation generation failed: {e}")
            return self._fallback_explanation(fraud_score)
    
    async def chat(
        self,
        question: str,
        context: Optional[Dict[str, Any]] = None,
        transaction_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Handle chatbot conversation.
        
        Args:
            question: User's question
            context: Conversation history
            transaction_data: Optional transaction context
        
        Returns:
            Dict with response and updated context
        """
        if not self.client:
            return {
                "response": "AI assistant is not configured. Please set OPENAI_API_KEY environment variable.",
                "context": context
            }
        
        try:
            messages = build_chat_prompt(question, context, transaction_data)
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            answer = response.choices[0].message.content
            
            # Update context with new messages
            if context is None:
                context = {"history": []}
            
            context["history"] = context.get("history", [])
            context["history"].append({"role": "user", "content": question})
            context["history"].append({"role": "assistant", "content": answer})
            
            # Keep only last 10 messages
            context["history"] = context["history"][-10:]
            
            return {
                "response": answer,
                "context": context
            }
        
        except Exception as e:
            logger.error(f"Chatbot conversation failed: {e}")
            return {
                "response": "Sorry, I encountered an error processing your request. Please try again.",
                "context": context
            }
    
    def _parse_explanation_response(
        self,
        explanation: str,
        fraud_score: float
    ) -> Dict[str, Any]:
        """Parse AI response into structured format."""
        # Determine risk level
        if fraud_score >= 0.7:
            risk_level = "HIGH"
        elif fraud_score >= 0.5:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        # Try to extract recommendation from text
        recommendation = "REVIEW"
        explanation_lower = explanation.lower()
        if "block" in explanation_lower or "decline" in explanation_lower:
            recommendation = "BLOCK"
        elif "allow" in explanation_lower or "approve" in explanation_lower:
            recommendation = "ALLOW"
        
        return {
            "explanation": explanation,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "ai_generated": True
        }
    
    def _fallback_explanation(self, fraud_score: float) -> Dict[str, Any]:
        """Generate basic explanation without OpenAI."""
        if fraud_score >= 0.7:
            risk_level = "HIGH"
            summary = "This transaction shows high fraud risk indicators."
            recommendation = "BLOCK"
        elif fraud_score >= 0.5:
            risk_level = "MEDIUM"
            summary = "This transaction shows moderate fraud risk and requires review."
            recommendation = "REVIEW"
        else:
            risk_level = "LOW"
            summary = "This transaction appears to have normal risk characteristics."
            recommendation = "ALLOW"
        
        return {
            "explanation": f"{summary} Fraud score: {fraud_score:.1%}",
            "risk_level": risk_level,
            "recommendation": recommendation,
            "ai_generated": False
        }
    
    def is_configured(self) -> bool:
        """Check if OpenAI is properly configured."""
        return self.client is not None


# Singleton instance
ai_explainer = AIExplainerService()
