"use client";

import { useState } from "react";
import Link from "next/link";

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:5000";

interface Feature {
  name: string;
  value: number | string;
  impact: number;
}

interface ExplanationResult {
  transaction_id: string;
  fraud_score: number;
  is_fraud: boolean;
  narrative: string;
  top_features: Feature[];
  base_value?: number;
}

export default function ExplainPage() {
  const [transactionId, setTransactionId] = useState("");
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const fetchExplanation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;

    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`${ML_API_URL}/explain/${transactionId}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      if (!res.ok) {
        throw new Error(`ML service returned ${res.status}`);
      }

      const data = await res.json();
      setExplanation(data);
      setStatus("idle");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch explanation");
      setStatus("error");
    }
  };

  // Demo explanation for when ML service doesn't have /explain endpoint yet
  const loadDemo = () => {
    setExplanation({
      transaction_id: "TXN001",
      fraud_score: 0.87,
      is_fraud: true,
      narrative:
        "This transaction was flagged as potentially fraudulent primarily because: the transaction amount (£4,200) is unusually high for this vendor; the vendor location changed recently; high transaction frequency (3 transactions in 10 minutes). Mitigating factors include: established vendor (active for 180 days).",
      top_features: [
        { name: "transaction_amount", value: 4200, impact: 0.312 },
        { name: "location_change", value: 1, impact: 0.241 },
        { name: "transaction_frequency", value: 3, impact: 0.198 },
        { name: "amount_deviation", value: 2.8, impact: 0.156 },
        { name: "new_vendor_flag", value: 0, impact: -0.089 },
        { name: "vendor_age_days", value: 180, impact: -0.134 },
      ],
      base_value: 0.05,
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">← Home</Link>
          <h1 className="text-lg font-bold">🔍 Transaction Explainability</h1>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Search Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="font-bold text-white mb-2">Why was this transaction flagged?</h2>
          <p className="text-gray-400 text-sm mb-4">
            Enter a transaction ID to fetch SHAP-based explanation from your Flask ML service.
          </p>
          <form onSubmit={fetchExplanation} className="flex gap-3">
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. TXN001"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              {status === "loading" ? "Loading..." : "Explain"}
            </button>
            <button
              type="button"
              onClick={loadDemo}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Load Demo
            </button>
          </form>

          {status === "error" && (
            <p className="text-red-400 text-sm mt-3">
              ❌ {error} — Make sure your Flask app has a <code className="text-red-300">/explain/&lt;id&gt;</code> endpoint,
              or click &quot;Load Demo&quot; to see a sample.
            </p>
          )}
        </div>

        {/* Explanation Panel */}
        {explanation && (
          <div className="space-y-6">
            {/* Transaction Header */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Transaction ID</p>
                  <p className="font-mono text-lg font-bold">{explanation.transaction_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Fraud Score</p>
                  <p className={`text-3xl font-bold ${explanation.fraud_score >= 0.7 ? "text-red-400" : explanation.fraud_score >= 0.4 ? "text-yellow-400" : "text-green-400"}`}>
                    {(explanation.fraud_score * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  {explanation.is_fraud ? (
                    <span className="px-4 py-2 bg-red-900/50 text-red-300 rounded-xl font-bold text-lg">🚨 FRAUD</span>
                  ) : (
                    <span className="px-4 py-2 bg-green-900/50 text-green-300 rounded-xl font-bold text-lg">✓ CLEAN</span>
                  )}
                </div>
              </div>
            </div>

            {/* Narrative */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-3">📝 Plain English Explanation</h3>
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                <p className="text-amber-100 leading-relaxed">{explanation.narrative}</p>
              </div>
            </div>

            {/* SHAP Feature Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-2">📊 Feature Impact (SHAP Values)</h3>
              <p className="text-xs text-gray-400 mb-4">
                🔴 Positive = increases fraud risk &nbsp;|&nbsp; 🟢 Negative = reduces fraud risk
              </p>
              <div className="space-y-3">
                {explanation.top_features
                  .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
                  .map((f) => {
                    const maxImpact = Math.max(...explanation.top_features.map((x) => Math.abs(x.impact)));
                    const barWidth = (Math.abs(f.impact) / maxImpact) * 100;
                    const isPositive = f.impact > 0;
                    return (
                      <div key={f.name} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-40 text-right truncate">
                          {f.name.replace(/_/g, " ")}
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          {isPositive ? (
                            <>
                              <div className="w-1/2 flex justify-end">
                                <div className="h-5 bg-gray-700 rounded-l" style={{ width: "100%" }} />
                              </div>
                              <div className="w-1/2">
                                <div
                                  className="h-5 bg-red-500 rounded-r"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-1/2 flex justify-end">
                                <div
                                  className="h-5 bg-green-500 rounded-l"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                              <div className="w-1/2">
                                <div className="h-5 bg-gray-700 rounded-r" style={{ width: "100%" }} />
                              </div>
                            </>
                          )}
                        </div>
                        <span className={`text-xs font-mono w-16 ${isPositive ? "text-red-400" : "text-green-400"}`}>
                          {isPositive ? "+" : ""}{f.impact.toFixed(3)}
                        </span>
                      </div>
                    );
                  })}
              </div>
              {explanation.base_value !== undefined && (
                <p className="text-xs text-gray-500 mt-4">
                  Base value (expected fraud rate): {(explanation.base_value * 100).toFixed(2)}%
                </p>
              )}
            </div>

            {/* Risk/Safety Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-red-900/50 rounded-xl p-6">
                <h3 className="font-bold text-red-400 mb-3">🔴 Risk Factors</h3>
                <ul className="space-y-2">
                  {explanation.top_features.filter((f) => f.impact > 0.05).map((f) => (
                    <li key={f.name} className="flex justify-between text-sm">
                      <span className="text-gray-300">{f.name.replace(/_/g, " ")}</span>
                      <span className="text-red-400 font-mono">+{f.impact.toFixed(3)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-900 border border-green-900/50 rounded-xl p-6">
                <h3 className="font-bold text-green-400 mb-3">🟢 Mitigating Factors</h3>
                <ul className="space-y-2">
                  {explanation.top_features.filter((f) => f.impact < -0.05).map((f) => (
                    <li key={f.name} className="flex justify-between text-sm">
                      <span className="text-gray-300">{f.name.replace(/_/g, " ")}</span>
                      <span className="text-green-400 font-mono">{f.impact.toFixed(3)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Flask endpoint hint */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-white mb-3">🐍 Add /explain endpoint to your Flask app</h3>
          <pre className="bg-gray-800 rounded-lg p-4 text-xs text-green-300 overflow-auto">
{`@app.route('/explain/<transaction_id>')
def explain(transaction_id):
    # Get SHAP values for this transaction
    # shap_values = explainer.shap_values(X_transaction)
    
    return jsonify({
        "transaction_id": transaction_id,
        "fraud_score": 0.87,
        "is_fraud": True,
        "narrative": "Transaction flagged due to high amount and location change.",
        "top_features": [
            {"name": "transaction_amount", "value": 4200, "impact": 0.312},
            {"name": "location_change", "value": 1, "impact": 0.241},
        ],
        "base_value": 0.05
    })`}
          </pre>
        </div>
      </div>
    </div>
  );
}
