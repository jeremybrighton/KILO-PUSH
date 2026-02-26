"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ML_API_URL = "https://scientistic-subcheliform-syreeta.ngrok-free.dev";

// Placeholder data for Phase 5 dashboard (replace with real ML results)
const PLACEHOLDER_GEO = [
  { region: "London", transaction_count: 1240, fraud_count: 87, avg_score: 0.72 },
  { region: "Manchester", transaction_count: 890, fraud_count: 34, avg_score: 0.38 },
  { region: "Birmingham", transaction_count: 650, fraud_count: 52, avg_score: 0.61 },
  { region: "Leeds", transaction_count: 420, fraud_count: 12, avg_score: 0.29 },
  { region: "Unknown", transaction_count: 310, fraud_count: 98, avg_score: 0.84 },
];

const PLACEHOLDER_VENDORS = [
  { vendor_name: "NewVendorXYZ", total_transactions: 45, fraud_count: 38, risk_score: 0.91 },
  { vendor_name: "TechCorp Ltd", total_transactions: 320, fraud_count: 67, risk_score: 0.74 },
  { vendor_name: "QuickPay Inc", total_transactions: 180, fraud_count: 29, risk_score: 0.58 },
  { vendor_name: "SafeShop", total_transactions: 890, fraud_count: 12, risk_score: 0.13 },
  { vendor_name: "CafeChain", total_transactions: 1200, fraud_count: 8, risk_score: 0.07 },
];

const PLACEHOLDER_TIMESERIES = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const fraud = Math.floor(Math.random() * 20) + (i === 15 ? 45 : 0); // Spike on day 15
  return {
    date: date.toISOString().split("T")[0],
    total: Math.floor(Math.random() * 100) + 50,
    fraud_count: fraud,
    avg_score: (Math.random() * 0.3 + 0.1 + (i === 15 ? 0.4 : 0)).toFixed(3),
  };
});

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "geo" | "vendors" | "timeseries">("overview");
  const [mlStatus, setMlStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    fetch(`${ML_API_URL}/health`, { headers: { "ngrok-skip-browser-warning": "true" } })
      .then((r) => setMlStatus(r.ok ? "online" : "offline"))
      .catch(() => setMlStatus("offline"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white text-sm">← Home</Link>
            <h1 className="text-lg font-bold">📊 Analytics Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${mlStatus === "online" ? "bg-green-400 animate-pulse" : mlStatus === "offline" ? "bg-red-400" : "bg-yellow-400"}`}></span>
            <span className={`text-xs ${mlStatus === "online" ? "text-green-400" : mlStatus === "offline" ? "text-red-400" : "text-yellow-400"}`}>
              ML Service {mlStatus === "checking" ? "Checking..." : mlStatus}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Transactions", value: "3,510", change: "+12%", color: "blue" },
            { label: "Fraud Detected", value: "283", change: "+5%", color: "red" },
            { label: "Fraud Rate", value: "8.1%", change: "-2%", color: "orange" },
            { label: "High-Risk Vendors", value: "3", change: "same", color: "purple" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.change} vs last period</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          {(["overview", "geo", "vendors", "timeseries"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab === "timeseries" ? "Time Series" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">🗺️ Top Risk Regions</h3>
              <div className="space-y-3">
                {PLACEHOLDER_GEO.map((r) => (
                  <div key={r.region} className="flex items-center gap-3">
                    <span className="text-sm text-gray-300 w-24">{r.region}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${r.avg_score >= 0.7 ? "bg-red-500" : r.avg_score >= 0.4 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${r.avg_score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right">{(r.avg_score * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">🏢 Vendor Risk Rankings</h3>
              <div className="space-y-2">
                {PLACEHOLDER_VENDORS.slice(0, 5).map((v, i) => (
                  <div key={v.vendor_name} className="flex items-center justify-between py-2 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-4">#{i + 1}</span>
                      <span className="text-sm text-gray-200">{v.vendor_name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      v.risk_score >= 0.7 ? "bg-red-900/50 text-red-300" :
                      v.risk_score >= 0.4 ? "bg-yellow-900/50 text-yellow-300" :
                      "bg-green-900/50 text-green-300"
                    }`}>
                      {(v.risk_score * 100).toFixed(0)}% risk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Geo Tab */}
        {activeTab === "geo" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-bold">Geographic Fraud Risk</h3>
              <p className="text-xs text-gray-400">Placeholder data — will update with real ML results</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400">Region</th>
                  <th className="text-right px-4 py-3 text-gray-400">Transactions</th>
                  <th className="text-right px-4 py-3 text-gray-400">Fraud Count</th>
                  <th className="text-right px-4 py-3 text-gray-400">Fraud Rate</th>
                  <th className="text-left px-4 py-3 text-gray-400">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {PLACEHOLDER_GEO.map((r) => (
                  <tr key={r.region} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium">{r.region}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{r.transaction_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-red-400">{r.fraud_count}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${r.avg_score >= 0.7 ? "bg-red-500" : r.avg_score >= 0.4 ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: `${r.avg_score * 100}%` }} />
                        </div>
                        {(r.avg_score * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${r.avg_score >= 0.7 ? "bg-red-900/50 text-red-300" : r.avg_score >= 0.4 ? "bg-yellow-900/50 text-yellow-300" : "bg-green-900/50 text-green-300"}`}>
                        {r.avg_score >= 0.7 ? "High" : r.avg_score >= 0.4 ? "Medium" : "Low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === "vendors" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-bold">Vendor Risk Rankings</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400">Rank</th>
                  <th className="text-left px-4 py-3 text-gray-400">Vendor</th>
                  <th className="text-right px-4 py-3 text-gray-400">Transactions</th>
                  <th className="text-right px-4 py-3 text-gray-400">Fraud Count</th>
                  <th className="text-right px-4 py-3 text-gray-400">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {PLACEHOLDER_VENDORS.map((v, i) => (
                  <tr key={v.vendor_name} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500">#{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{v.vendor_name}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{v.total_transactions}</td>
                    <td className="px-4 py-3 text-right text-red-400">{v.fraud_count}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${v.risk_score >= 0.7 ? "bg-red-900/50 text-red-300" : v.risk_score >= 0.4 ? "bg-yellow-900/50 text-yellow-300" : "bg-green-900/50 text-green-300"}`}>
                        {(v.risk_score * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Time Series Tab */}
        {activeTab === "timeseries" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-bold mb-2">Daily Fraud Count (Last 30 Days)</h3>
            <p className="text-xs text-gray-400 mb-6">Placeholder data — spike on day 15 simulates anomaly detection</p>
            <div className="flex items-end gap-1 h-40">
              {PLACEHOLDER_TIMESERIES.map((d, i) => {
                const maxFraud = Math.max(...PLACEHOLDER_TIMESERIES.map((x) => x.fraud_count));
                const height = (d.fraud_count / maxFraud) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className={`w-full rounded-t transition ${d.fraud_count > 30 ? "bg-red-500" : "bg-blue-600"} hover:opacity-80`}
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute bottom-full mb-1 bg-gray-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {d.date}: {d.fraud_count} fraud
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{PLACEHOLDER_TIMESERIES[0].date}</span>
              <span>{PLACEHOLDER_TIMESERIES[PLACEHOLDER_TIMESERIES.length - 1].date}</span>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="mt-6 bg-blue-900/20 border border-blue-800/50 rounded-xl p-4">
          <p className="text-sm text-blue-300">
            📌 <strong>Phase 5 Note:</strong> This dashboard shows placeholder data.
            After uploading a CSV on the <a href="/upload" className="underline">Upload page</a>,
            real ML results from your Flask service will populate here.
          </p>
        </div>
      </div>
    </div>
  );
}
