"""
PHASE 7 — Chatbot Route
Conversational AI endpoint for fraud analysis.
Allows admins to ask questions about flagged transactions.

Architecture:
  Frontend → POST /chat → OpenAI → Contextual response

Features:
  - Context-aware conversations
  - Transaction-specific queries
  - Fraud investigation assistance
  - Historical context retention
"""

import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_explainer import AIExplainerService, ai_explainer

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Request schemas ────────────────────────────────────
class ChatMessage(BaseModel):
    """Single chat message."""
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    """Chat request with optional context."""
    message: str
    transaction_id: Optional[str] = None
    transaction_data: Optional[Dict[str, Any]] = None
    fraud_score: Optional[float] = None
    risk_factors: Optional[List[Dict[str, Any]]] = None
    context: Optional[Dict[str, Any]] = None  # Previous conversation history


class ExplainTransactionRequest(BaseModel):
    """Request for AI-generated transaction explanation."""
    transaction_id: str
    transaction_data: Dict[str, Any]
    fraud_score: float
    risk_factors: Optional[List[Dict[str, Any]]] = None


# ── POST /chat — Conversational AI ─────────────────────
@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Handle conversational AI queries about fraud detection.
    
    The AI can:
    - Answer questions about flagged transactions
    - Explain why a transaction was flagged
    - Provide investigation recommendations
    - Help analyze fraud patterns
    
    Context is maintained across messages for continuity.
    """
    logger.info(f"Chat request: {request.message[:50]}...")
    
    # Check if OpenAI is configured
    if not ai_explainer.is_configured():
        raise HTTPException(
            status_code=503,
            detail="AI assistant is not configured. Please set OPENAI_API_KEY environment variable."
        )
    
    try:
        result = await ai_explainer.chat(
            question=request.message,
            context=request.context,
            transaction_data=request.transaction_data
        )
        
        return {
            "success": True,
            "response": result["response"],
            "context": result["context"],
            "transaction_id": request.transaction_id
        }
    
    except Exception as e:
        logger.error(f"Chat request failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Chat processing failed: {str(e)}"
        )


# ── POST /explain/transaction — AI Explanation ──────────
@router.post("/explain/transaction")
async def explain_transaction(request: ExplainTransactionRequest):
    """
    Generate AI-powered explanation for a specific transaction.
    
    Uses OpenAI to provide:
    - Human-readable fraud explanation
    - Risk assessment
    - Investigation recommendations
    """
    logger.info(f"Generating AI explanation for transaction: {request.transaction_id}")
    
    # Check if OpenAI is configured
    if not ai_explainer.is_configured():
        # Return fallback explanation without AI
        fallback = ai_explainer._fallback_explanation(request.fraud_score)
        return {
            "success": True,
            "transaction_id": request.transaction_id,
            **fallback,
            "note": "AI explanation not available. Set OPENAI_API_KEY for AI-powered explanations."
        }
    
    try:
        result = await ai_explainer.generate_fraud_explanation(
            transaction_data=request.transaction_data,
            fraud_score=request.fraud_score,
            risk_factors=request.risk_factors
        )
        
        return {
            "success": True,
            "transaction_id": request.transaction_id,
            **result
        }
    
    except Exception as e:
        logger.error(f"Explanation generation failed: {e}")
        
        # Return fallback on error
        fallback = ai_explainer._fallback_explanation(request.fraud_score)
        return {
            "success": True,
            "transaction_id": request.transaction_id,
            **fallback,
            "error": str(e)
        }


# ── POST /explain/batch — Batch AI Explanations ────────
@router.post("/explain/batch")
async def explain_batch(
    transactions: List[ExplainTransactionRequest],
    background_tasks=None
):
    """
    Generate AI explanations for multiple transactions.
    Processes in background for large batches.
    """
    logger.info(f"Batch explanation request: {len(transactions)} transactions")
    
    results = []
    for tx in transactions:
        if ai_explainer.is_configured():
            try:
                result = await ai_explainer.generate_fraud_explanation(
                    transaction_data=tx.transaction_data,
                    fraud_score=tx.fraud_score,
                    risk_factors=tx.risk_factors
                )
            except Exception as e:
                logger.error(f"Explanation failed for {tx.transaction_id}: {e}")
                result = ai_explainer._fallback_explanation(tx.fraud_score)
        else:
            result = ai_explainer._fallback_explanation(tx.fraud_score)
        
        results.append({
            "transaction_id": tx.transaction_id,
            **result
        })
    
    return {
        "success": True,
        "count": len(results),
        "results": results
    }


# ── GET /chat/status — Check AI Configuration ─────────
@router.get("/chat/status")
async def chat_status():
    """
    Check if AI chatbot is properly configured.
    """
    return {
        "configured": ai_explainer.is_configured(),
        "model": ai_explainer.model if ai_explainer.is_configured() else None,
        "message": "AI assistant ready" if ai_explainer.is_configured() 
                  else "Set OPENAI_API_KEY to enable AI assistant"
    }
