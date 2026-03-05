"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:5000";

interface PredictionResult {
  transaction_id: string;
  fraud_score: number;
  is_fraud: boolean;
  is_anomaly: boolean;
  vendor_id?: string;
  vendor_name?: string;
  region?: string;
  amount?: number;
}

interface ProcessingState {
  status: "idle" | "uploading" | "processing" | "done" | "error";
  results: PredictionResult[];
  error?: string;
  stats?: {
    total: number;
    fraud: number;
    anomalies: number;
    avgScore: number;
  };
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ProcessingState>({ status: "idle", results: [] });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setState({ status: "uploading", results: [] });

    try {
      // Parse CSV client-side
      const text = await file.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

      const transactions = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = values[i] || ""; });
        return obj;
      }).filter((t) => t[headers[0]]); // Filter empty rows

      setState({ status: "processing", results: [] });

      // Send to Flask ML service
      const res = await fetch(`${ML_API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ transactions }),
      });

      if (!res.ok) {
        throw new Error(`ML service returned ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const results: PredictionResult[] = data.results || data;

      // Calculate stats
      const fraud = results.filter((r) => r.is_fraud).length;
      const anomalies = results.filter((r) => r.is_anomaly).length;
      const avgScore = results.reduce((sum, r) => sum + (r.fraud_score || 0), 0) / results.length;

      setState({
        status: "done",
        results,
        stats: { total: results.length, fraud, anomalies, avgScore },
      });
    } catch (e: unknown) {
      setState({
        status: "error",
        results: [],
        error: e instanceof Error ? e.message : "Processing failed",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">← Home</Link>
          <h1 className="text-lg font-bold">📁 Upload Dataset</h1>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Upload Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-2">Upload CSV for Fraud Detection</h2>
          <p className="text-gray-400 text-sm mb-6">
            Your CSV will be parsed and sent directly to your Flask ML service at{" "}
            <code className="text-green-400">ngrok → localhost:5000/predict</code>
          </p>

          <form onSubmit={handleSubmit}>
            <div
              className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center mb-6 hover:border-blue-500 transition cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <div className="text-5xl mb-3">📄</div>
              {file ? (
                <div>
                  <p className="text-green-400 font-medium">✓ {file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 mb-1">Click to select a CSV file</p>
                  <p className="text-gray-500 text-sm">Must include a transaction_id column</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Sample CSV format */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-400 mb-2">Expected CSV format:</p>
              <code className="text-xs text-green-300">
                transaction_id,amount,vendor_id,vendor_name,region,timestamp
                <br />
                TXN001,4200.00,V001,TechCorp,London,2024-01-15
              </code>
            </div>

            <button
              type="submit"
              disabled={!file || state.status === "processing" || state.status === "uploading"}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition"
            >
              {state.status === "uploading" && "Parsing CSV..."}
              {state.status === "processing" && "Running ML Detection..."}
              {(state.status === "idle" || state.status === "done" || state.status === "error") && "Run Fraud Detection"}
            </button>
          </form>
        </div>

        {/* Error */}
        {state.status === "error" && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-red-300 mb-2">❌ Processing Failed</h3>
            <p className="text-red-200 text-sm">{state.error}</p>
            <p className="text-gray-400 text-xs mt-2">
              Make sure your Flask service is running and the ngrok tunnel is active.
              Check the <a href="/api-test" className="text-blue-400 underline">API Test page</a> to verify connectivity.
            </p>
          </div>
        )}

        {/* Results */}
        {state.status === "done" && state.stats && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Transactions" value={state.stats.total} color="blue" />
              <StatCard label="Flagged as Fraud" value={state.stats.fraud} color="red" />
              <StatCard label="Anomalies" value={state.stats.anomalies} color="orange" />
              <StatCard label="Avg Risk Score" value={`${(state.stats.avgScore * 100).toFixed(1)}%`} color="purple" />
            </div>

            {/* Results Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-bold">Detection Results</h3>
                <span className="text-sm text-gray-400">{state.results.length} transactions</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-400">Transaction ID</th>
                      <th className="text-right px-4 py-3 text-gray-400">Fraud Score</th>
                      <th className="text-center px-4 py-3 text-gray-400">Status</th>
                      <th className="text-left px-4 py-3 text-gray-400">Vendor</th>
                      <th className="text-left px-4 py-3 text-gray-400">Region</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {state.results.map((r) => (
                      <tr key={r.transaction_id} className={`hover:bg-gray-800/50 ${r.is_fraud ? "bg-red-950/20" : ""}`}>
                        <td className="px-4 py-3 font-mono text-xs">{r.transaction_id}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  r.fraud_score >= 0.7 ? "bg-red-500" :
                                  r.fraud_score >= 0.4 ? "bg-yellow-500" : "bg-green-500"
                                }`}
                                style={{ width: `${(r.fraud_score || 0) * 100}%` }}
                              />
                            </div>
                            <span className={r.fraud_score >= 0.5 ? "text-red-400" : "text-gray-300"}>
                              {((r.fraud_score || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {r.is_fraud ? (
                            <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs">🚨 Fraud</span>
                          ) : r.is_anomaly ? (
                            <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-xs">⚠️ Anomaly</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">✓ Clean</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-300">{r.vendor_name || r.vendor_id || "—"}</td>
                        <td className="px-4 py-3 text-gray-300">{r.region || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-400",
    red: "text-red-400",
    orange: "text-orange-400",
    purple: "text-purple-400",
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color] || "text-white"}`}>{value}</p>
    </div>
  );
}
