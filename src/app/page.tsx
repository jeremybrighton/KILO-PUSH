"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-xl font-bold text-white">FraudGuard</h1>
              <p className="text-xs text-gray-400">ML-Powered Fraud Detection</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs text-green-400">ML Service Connected</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/50 rounded-full px-4 py-2 text-sm text-blue-300 mb-6">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          Phases 3–7 Scaffolding Ready
        </div>
        <h2 className="text-5xl font-bold text-white mb-4">
          Fraud Detection
          <span className="text-blue-400"> Dashboard</span>
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Upload transaction datasets, run ML fraud detection via your Flask microservice,
          and visualize results with SHAP explainability.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/upload"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition">
            Upload Dataset →
          </Link>
          <Link href="/dashboard"
            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition border border-gray-700">
            View Dashboard
          </Link>
          <Link href="/api-test"
            className="bg-green-800 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition border border-green-700">
            Test ML API
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              phase: "Phase 3",
              icon: "🔐",
              title: "Auth & Uploads",
              desc: "Role-based access, CSV uploads, job queue management",
              color: "blue",
              href: "/upload",
            },
            {
              phase: "Phase 4",
              icon: "🔗",
              title: "ML Integration",
              desc: "Flask microservice via ngrok, async job processing",
              color: "purple",
              href: "/api-test",
            },
            {
              phase: "Phase 5",
              icon: "📊",
              title: "Analytics",
              desc: "Geo fraud maps, vendor risk rankings, time-series charts",
              color: "orange",
              href: "/dashboard",
            },
            {
              phase: "Phase 6",
              icon: "🔍",
              title: "Explainability",
              desc: "SHAP feature importance, human-readable narratives",
              color: "green",
              href: "/explain",
            },
            {
              phase: "NEW",
              icon: "🤖",
              title: "AI Assistant",
              desc: "Chatbot for contextual fraud analysis and explanations",
              color: "indigo",
              href: "/chatbot",
            },
          ].map((card) => (
            <Link key={card.phase} href={card.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition group">
              <div className="text-3xl mb-3">{card.icon}</div>
              <div className={`text-xs font-medium text-${card.color}-400 mb-1`}>{card.phase}</div>
              <h3 className="font-bold text-white mb-2 group-hover:text-blue-300 transition">{card.title}</h3>
              <p className="text-sm text-gray-400">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ML Service Status */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-white mb-4">🔌 ML Service Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 mb-1">Ngrok Tunnel URL</p>
              <code className="text-green-400 text-xs break-all">
                https://scientistic-subcheliform-syreeta.ngrok-free.dev
              </code>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 mb-1">Local Flask Service</p>
              <code className="text-blue-400 text-xs">http://localhost:5000</code>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
