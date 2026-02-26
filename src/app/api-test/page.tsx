"use client";

import { useState } from "react";
import Link from "next/link";

const ML_API_URL = "https://scientistic-subcheliform-syreeta.ngrok-free.dev";

interface ApiResult {
  status: "idle" | "loading" | "success" | "error";
  data: unknown;
  error?: string;
  duration?: number;
}

export default function ApiTestPage() {
  const [healthResult, setHealthResult] = useState<ApiResult>({ status: "idle", data: null });
  const [predictResult, setPredictResult] = useState<ApiResult>({ status: "idle", data: null });
  const [csvData, setCsvData] = useState<string>("");

  // Test health endpoint
  const testHealth = async () => {
    setHealthResult({ status: "loading", data: null });
    const start = Date.now();
    try {
      const res = await fetch(`${ML_API_URL}/health`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      const data = await res.json();
      setHealthResult({
        status: res.ok ? "success" : "error",
        data,
        duration: Date.now() - start,
      });
    } catch (e: unknown) {
      setHealthResult({
        status: "error",
        data: null,
        error: e instanceof Error ? e.message : "Connection failed",
        duration: Date.now() - start,
      });
    }
  };

  // Test predict endpoint with sample CSV data
  const testPredict = async () => {
    setPredictResult({ status: "loading", data: null });
    const start = Date.now();

    // Sample transaction data for testing
    const samplePayload = {
      transactions: [
        { transaction_id: "TXN001", amount: 4200.00, vendor_id: "V001", vendor_name: "TechCorp", region: "London" },
        { transaction_id: "TXN002", amount: 15.50, vendor_id: "V002", vendor_name: "CafeShop", region: "Manchester" },
        { transaction_id: "TXN003", amount: 9800.00, vendor_id: "V003", vendor_name: "NewVendor", region: "Unknown" },
      ],
    };

    try {
      const res = await fetch(`${ML_API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(samplePayload),
      });
      const data = await res.json();
      setPredictResult({
        status: res.ok ? "success" : "error",
        data,
        duration: Date.now() - start,
      });
    } catch (e: unknown) {
      setPredictResult({
        status: "error",
        data: null,
        error: e instanceof Error ? e.message : "Request failed",
        duration: Date.now() - start,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">← Home</Link>
          <h1 className="text-lg font-bold">🔌 ML API Test Console</h1>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* API URL Banner */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-300 mb-1">Connected to Flask ML Service via Ngrok</p>
          <code className="text-green-400 text-sm break-all">{ML_API_URL}</code>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Check */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-white">Health Check</h2>
                <p className="text-xs text-gray-400">GET /health</p>
              </div>
              <button
                onClick={testHealth}
                disabled={healthResult.status === "loading"}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                {healthResult.status === "loading" ? "Testing..." : "Test"}
              </button>
            </div>

            <StatusBadge result={healthResult} />

            {healthResult.status !== "idle" && (
              <div className="mt-3 bg-gray-800 rounded-lg p-3">
                <pre className="text-xs text-gray-300 overflow-auto max-h-40">
                  {JSON.stringify(healthResult.data || healthResult.error, null, 2)}
                </pre>
                {healthResult.duration && (
                  <p className="text-xs text-gray-500 mt-2">{healthResult.duration}ms</p>
                )}
              </div>
            )}
          </div>

          {/* Predict Test */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-white">Fraud Prediction</h2>
                <p className="text-xs text-gray-400">POST /predict</p>
              </div>
              <button
                onClick={testPredict}
                disabled={predictResult.status === "loading"}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                {predictResult.status === "loading" ? "Running..." : "Run Test"}
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-3">
              Sends 3 sample transactions (TXN001–TXN003) to your Flask model
            </p>

            <StatusBadge result={predictResult} />

            {predictResult.status !== "idle" && (
              <div className="mt-3 bg-gray-800 rounded-lg p-3">
                <pre className="text-xs text-gray-300 overflow-auto max-h-60">
                  {JSON.stringify(predictResult.data || predictResult.error, null, 2)}
                </pre>
                {predictResult.duration && (
                  <p className="text-xs text-gray-500 mt-2">{predictResult.duration}ms</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Available Endpoints */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="font-bold text-white mb-4">📋 Expected Flask Endpoints</h2>
          <p className="text-sm text-gray-400 mb-4">
            Your Flask app at <code className="text-green-400">localhost:5000</code> should expose these endpoints.
            If they don&apos;t exist yet, add them to your Flask app.
          </p>
          <div className="space-y-3">
            {[
              { method: "GET", path: "/health", desc: "Service health check", required: true },
              { method: "POST", path: "/predict", desc: "Run fraud prediction on transactions JSON", required: true },
              { method: "POST", path: "/process-dataset", desc: "Process a CSV file path (called by Laravel job)", required: false },
              { method: "POST", path: "/explain", desc: "Generate SHAP explanations (Phase 6)", required: false },
            ].map((ep) => (
              <div key={ep.path} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                  ep.method === "GET" ? "bg-green-900 text-green-300" : "bg-blue-900 text-blue-300"
                }`}>
                  {ep.method}
                </span>
                <code className="text-white text-sm flex-1">{ep.path}</code>
                <span className="text-xs text-gray-400 flex-1">{ep.desc}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  ep.required ? "bg-red-900/50 text-red-300" : "bg-gray-700 text-gray-400"
                }`}>
                  {ep.required ? "Required" : "Optional"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Flask Code Snippet */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="font-bold text-white mb-4">🐍 Minimum Flask App (add to your app.py)</h2>
          <pre className="bg-gray-800 rounded-lg p-4 text-xs text-green-300 overflow-auto">
{`from flask import Flask, request, jsonify
import pandas as pd

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({"status": "ok", "service": "ml-service"})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    transactions = data.get('transactions', [])
    
    # TODO: Replace with your actual model prediction
    results = []
    for tx in transactions:
        # Placeholder: your model goes here
        fraud_score = 0.1  # model.predict_proba([features])[0][1]
        results.append({
            "transaction_id": tx.get("transaction_id"),
            "fraud_score": fraud_score,
            "is_fraud": fraud_score >= 0.5,
            "is_anomaly": fraud_score >= 0.7,
        })
    
    return jsonify({"status": "success", "results": results})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ result }: { result: ApiResult }) {
  if (result.status === "idle") return null;
  if (result.status === "loading") {
    return (
      <div className="flex items-center gap-2 text-yellow-400 text-sm">
        <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        Connecting...
      </div>
    );
  }
  if (result.status === "success") {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <span>✓</span> Success
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm">
      <span>✗</span> {result.error || "Failed"}
    </div>
  );
}
