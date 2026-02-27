"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Globe, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  ChevronRight,
  Zap,
  Eye,
  Lock,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react";

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:5000";

// Placeholder data for fraud dashboard
const PLACEHOLDER_ALERTS = [
  { id: 1, type: "critical", message: "Unusual transaction spike detected from Unknown region", time: "2 min ago", severity: 95 },
  { id: 2, type: "warning", message: "New vendor 'NewVendorXYZ' exceeds risk threshold", time: "15 min ago", severity: 87 },
  { id: 3, type: "info", message: "Daily fraud report generated successfully", time: "1 hour ago", severity: 0 },
  { id: 4, type: "warning", message: "High-frequency transactions detected from single IP", time: "2 hours ago", severity: 72 },
];

const PLACEHOLDER_ACTIVITY = [
  { id: 1, action: "Transaction analyzed", entity: "TXN-78291", user: "System", timestamp: "Just now", status: "success" },
  { id: 2, action: "Fraud detected", entity: "TXN-78285", user: "ML Model v2.1", timestamp: "2 min ago", status: "critical" },
  { id: 3, action: "Threshold exceeded", entity: "Vendor: QuickPay", user: "Auto-flag", timestamp: "5 min ago", status: "warning" },
  { id: 4, action: "Dataset processed", entity: "batch_20260227", user: "System", timestamp: "10 min ago", status: "success" },
  { id: 5, action: "User login", entity: "admin@fraugguard.com", user: "Admin", timestamp: "15 min ago", status: "info" },
];

const PLACEHOLDER_GEO = [
  { region: "London", country: "GB", transaction_count: 1240, fraud_count: 87, avg_score: 0.72, flag: "🇬🇧" },
  { region: "Manchester", country: "GB", transaction_count: 890, fraud_count: 34, avg_score: 0.38, flag: "🇬🇧" },
  { region: "Birmingham", country: "GB", transaction_count: 650, fraud_count: 52, avg_score: 0.61, flag: "🇬🇧" },
  { region: "Unknown", country: "XX", transaction_count: 310, fraud_count: 98, avg_score: 0.94, flag: "🌐" },
  { region: "New York", country: "US", transaction_count: 420, fraud_count: 12, avg_score: 0.29, flag: "🇺🇸" },
];

const PLACEHOLDER_VENDORS = [
  { vendor_name: "NewVendorXYZ", total_transactions: 45, fraud_count: 38, risk_score: 0.91, trend: "up" },
  { vendor_name: "TechCorp Ltd", total_transactions: 320, fraud_count: 67, risk_score: 0.74, trend: "stable" },
  { vendor_name: "QuickPay Inc", total_transactions: 180, fraud_count: 29, risk_score: 0.58, trend: "down" },
  { vendor_name: "SafeShop", total_transactions: 890, fraud_count: 12, risk_score: 0.13, trend: "down" },
  { vendor_name: "CafeChain", total_transactions: 1200, fraud_count: 8, risk_score: 0.07, trend: "stable" },
];

const PLACEHOLDER_SUSPICIOUS = [
  { id: "TXN-99021", vendor: "NewVendorXYZ", amount: 12500, score: 0.94, time: "2 min ago", pattern: "Unusual amount" },
  { id: "TXN-99018", vendor: "Unknown", amount: 8900, score: 0.91, time: "8 min ago", pattern: "High-risk geo" },
  { id: "TXN-99015", vendor: "TechCorp Ltd", amount: 4200, score: 0.87, time: "15 min ago", pattern: "Velocity spike" },
  { id: "TXN-99012", vendor: "QuickPay Inc", amount: 3100, score: 0.82, time: "22 min ago", pattern: "Time anomaly" },
];

const PLACEHOLDER_TIMESERIES = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  const isSpike = i === 10;
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    total: Math.floor(Math.random() * 100) + 50,
    fraud_count: isSpike ? Math.floor(Math.random() * 15) + 25 : Math.floor(Math.random() * 10) + 2,
    flag_count: isSpike ? Math.floor(Math.random() * 8) + 10 : Math.floor(Math.random() * 3) + 1,
  };
});

// Sidebar component
function Sidebar({ activePage }: { activePage: string }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Shield, href: "/dashboard" },
    { id: "upload", label: "Upload Data", icon: Database, href: "/upload" },
    { id: "explain", label: "Explainability", icon: Eye, href: "/explain" },
    { id: "chatbot", label: "AI Assistant", icon: Activity, href: "/chatbot" },
    { id: "api-test", label: "API Test", icon: Zap, href: "/api-test" },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">FraudGuard</h1>
            <p className="text-slate-400 text-xs">ML Security Platform</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-3 mx-4 mt-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">System Status</span>
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Active
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">ML Model</span>
          <span className="text-xs text-cyan-400 font-mono">v2.1.0</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-slate-800">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <div className="mt-4 flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-xs text-white font-medium">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">Admin User</p>
            <p className="text-xs text-slate-400">admin@fraugguard.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// KPI Card component
function KPICard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  accentColor 
}: { 
  title: string; 
  value: string; 
  change: string; 
  changeType: "up" | "down" | "neutral"; 
  icon: React.ElementType; 
  accentColor: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${accentColor}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${
          changeType === "up" ? "text-red-400" : changeType === "down" ? "text-green-400" : "text-slate-400"
        }`}>
          {changeType === "up" && <ArrowUpRight className="w-3 h-3" />}
          {changeType === "down" && <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

// Risk Score Gauge component
function RiskScoreGauge({ score }: { score: number }) {
  const percentage = score * 100;
  const rotation = (percentage / 100) * 180 - 90;
  const getColor = (s: number) => {
    if (s >= 0.7) return "text-red-500";
    if (s >= 0.4) return "text-amber-500";
    return "text-green-500";
  };
  const getBgColor = (s: number) => {
    if (s >= 0.7) return "from-red-500 to-red-600";
    if (s >= 0.4) return "from-amber-500 to-orange-500";
    return "from-green-500 to-emerald-600";
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-cyan-400" />
        Real-Time Risk Score
      </h3>
      <div className="relative flex items-center justify-center">
        {/* Gauge background */}
        <div className="w-40 h-20 overflow-hidden">
          <div className="w-40 h-40 rounded-full border-[12px] border-slate-700"></div>
        </div>
        {/* Gauge fill */}
        <div 
          className="absolute w-40 h-20 overflow-hidden"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
        >
          <div className="w-40 h-40 rounded-full border-[12px] border-transparent border-t-current"></div>
        </div>
        {/* Animated indicator */}
        <div 
          className="absolute w-32 h-1 bg-gradient-to-r from-green-500 via-amber-500 to-red-500 rounded-full opacity-30"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        ></div>
        {/* Needle */}
        <div 
          className="absolute w-24 h-1 bg-white origin-left rounded-full"
          style={{ 
            top: "50%", 
            transform: `translateY(-50%) rotate(${rotation}deg)`,
            transformOrigin: "left center"
          }}
        ></div>
        {/* Center dot */}
        <div className="absolute w-3 h-3 bg-white rounded-full"></div>
      </div>
      <div className="text-center mt-2">
        <span className={`text-3xl font-bold ${getColor(score)}`}>
          {percentage.toFixed(0)}
        </span>
        <span className="text-slate-400 text-sm ml-1">/100</span>
      </div>
      <div className="flex justify-between mt-3 text-xs text-slate-500">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}

// Alert Panel component
function AlertPanel() {
  const [alerts, setAlerts] = useState(PLACEHOLDER_ALERTS);
  const [isMinimized, setIsMinimized] = useState(false);

  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return "red";
    if (severity >= 50) return "amber";
    return "slate";
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">Security Alerts</h3>
          <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">{alerts.length}</span>
        </div>
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-slate-400 hover:text-white text-xs"
        >
          {isMinimized ? "Expand" : "Minimize"}
        </button>
      </div>
      {!isMinimized && (
        <div className="divide-y divide-slate-700/30 max-h-64 overflow-y-auto">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-3 hover:bg-slate-700/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-1 rounded ${
                  alert.type === "critical" ? "bg-red-500/20" : 
                  alert.type === "warning" ? "bg-amber-500/20" : "bg-blue-500/20"
                }`}>
                  <AlertTriangle className={`w-3 h-3 ${
                    alert.type === "critical" ? "text-red-400" : 
                    alert.type === "warning" ? "text-amber-400" : "text-blue-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 line-clamp-2">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{alert.time}</span>
                    {alert.severity > 0 && (
                      <span className={`px-1.5 py-0.5 text-xs rounded ${
                        alert.severity >= 80 ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {alert.severity}% severity
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Activity Feed component
function ActivityFeed() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Activity Log</h3>
        </div>
      </div>
      <div className="divide-y divide-slate-700/30 max-h-64 overflow-y-auto">
        {PLACEHOLDER_ACTIVITY.map((item) => (
          <div key={item.id} className="p-3 hover:bg-slate-700/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                item.status === "critical" ? "bg-red-500" :
                item.status === "warning" ? "bg-amber-500" :
                item.status === "success" ? "bg-green-500" : "bg-blue-500"
              }`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200">
                  <span className="text-slate-400">{item.action}</span>
                  <span className="text-cyan-400 mx-1">{item.entity}</span>
                </p>
                <p className="text-xs text-slate-500">{item.timestamp} • {item.user}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fraud Spike Indicator component
function FraudSpikeIndicator() {
  const [isSpike, setIsSpike] = useState(true);
  
  return (
    <div className={`border rounded-xl p-4 flex items-center justify-between ${
      isSpike 
        ? "bg-red-500/10 border-red-500/30" 
        : "bg-slate-800/50 border-slate-700/50"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isSpike ? "bg-red-500/20" : "bg-slate-700"}`}>
          <Zap className={`w-5 h-5 ${isSpike ? "text-red-400 animate-pulse" : "text-slate-400"}`} />
        </div>
        <div>
          <p className={`text-sm font-medium ${isSpike ? "text-red-400" : "text-slate-300"}`}>
            {isSpike ? "⚠️ Anomaly Spike Detected" : "Monitoring Active"}
          </p>
          <p className="text-xs text-slate-500">
            {isSpike 
              ? "Unusual transaction pattern detected in Unknown region" 
              : "All systems operating normally"
            }
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isSpike ? "bg-red-500 animate-pulse" : "bg-green-500"}`}></span>
        <span className={`text-xs font-medium ${isSpike ? "text-red-400" : "text-green-400"}`}>
          {isSpike ? "ATTENTION" : "SECURE"}
        </span>
      </div>
    </div>
  );
}

// Transaction Table component
function SuspiciousTransactionsTable() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Suspicious Transactions</h3>
        </div>
        <button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50">
            <tr className="text-left text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Transaction ID</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium text-right">Risk Score</th>
              <th className="px-4 py-3 font-medium">Pattern</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {PLACEHOLDER_SUSPICIOUS.map((txn) => (
              <tr key={txn.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono text-cyan-400">{txn.id}</span>
                </td>
                <td className="px-4 py-3 text-slate-300">{txn.vendor}</td>
                <td className="px-4 py-3 text-right text-white font-medium">${txn.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                    txn.score >= 0.9 ? "bg-red-500/20 text-red-400" :
                    txn.score >= 0.7 ? "bg-amber-500/20 text-amber-400" :
                    "bg-slate-700 text-slate-400"
                  }`}>
                    {(txn.score * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">{txn.pattern}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{txn.time}</td>
                <td className="px-4 py-3">
                  <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Vendor Risk Ranking component
function VendorRiskRanking() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Vendor Risk Ranking</h3>
        </div>
        <button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="divide-y divide-slate-700/30">
        {PLACEHOLDER_VENDORS.map((vendor, i) => (
          <div key={vendor.vendor_name} className="p-4 hover:bg-slate-700/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-mono text-sm w-6">#{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-white">{vendor.vendor_name}</p>
                  <p className="text-xs text-slate-500">{vendor.total_transactions} transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    vendor.risk_score >= 0.7 ? "text-red-400" :
                    vendor.risk_score >= 0.4 ? "text-amber-400" : "text-green-400"
                  }`}>
                    {(vendor.risk_score * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-500">{vendor.fraud_count} fraud</p>
                </div>
                <div className={`p-1.5 rounded ${
                  vendor.trend === "up" ? "bg-red-500/20" :
                  vendor.trend === "down" ? "bg-green-500/20" : "bg-slate-700"
                }`}>
                  {vendor.trend === "up" && <ArrowUpRight className="w-3 h-3 text-red-400" />}
                  {vendor.trend === "down" && <ArrowDownRight className="w-3 h-3 text-green-400" />}
                  {vendor.trend === "stable" && <Activity className="w-3 h-3 text-slate-400" />}
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  vendor.risk_score >= 0.7 ? "bg-red-500" :
                  vendor.risk_score >= 0.4 ? "bg-amber-500" : "bg-green-500"
                }`}
                style={{ width: `${vendor.risk_score * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fraud Trend Chart component
function FraudTrendChart() {
  const maxFraud = Math.max(...PLACEHOLDER_TIMESERIES.map(d => d.fraud_count));

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Fraud Trend (14 Days)</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-red-500"></div>
            <span className="text-slate-400">Fraud</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-amber-500"></div>
            <span className="text-slate-400">Flagged</span>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-1 h-32">
        {PLACEHOLDER_TIMESERIES.map((d, i) => {
          const height = (d.fraud_count / maxFraud) * 100;
          const flagHeight = (d.flag_count / maxFraud) * 100;
          const isSpike = d.fraud_count > 15;
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
              {/* Flagged bars (stacked) */}
              <div 
                className="w-full rounded-t bg-amber-500/60"
                style={{ height: `${flagHeight}%`, minHeight: d.flag_count > 0 ? "2px" : "0" }}
              />
              {/* Fraud bars */}
              <div 
                className={`w-full rounded-t transition-all ${isSpike ? "bg-red-500" : "bg-cyan-600"} group-hover:opacity-80`}
                style={{ height: `${height - flagHeight}%`, minHeight: d.fraud_count > 0 ? "2px" : "0" }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                <div className="font-medium">{d.date}</div>
                <div className="text-red-400">{d.fraud_count} fraud</div>
                <div className="text-amber-400">{d.flag_count} flagged</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-2">
        <span>{PLACEHOLDER_TIMESERIES[0].date}</span>
        <span>{PLACEHOLDER_TIMESERIES[PLACEHOLDER_TIMESERIES.length - 1].date}</span>
      </div>
    </div>
  );
}

// Geo Risk Map component
function GeoRiskMap() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Geographic Risk Distribution</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3">
          {PLACEHOLDER_GEO.map((region) => (
            <div key={region.region} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors">
              <span className="text-2xl">{region.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{region.region}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    region.avg_score >= 0.7 ? "bg-red-500/20 text-red-400" :
                    region.avg_score >= 0.4 ? "bg-amber-500/20 text-amber-400" :
                    "bg-green-500/20 text-green-400"
                  }`}>
                    {region.avg_score >= 0.7 ? "HIGH" : region.avg_score >= 0.4 ? "MEDIUM" : "LOW"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{region.transaction_count.toLocaleString()} TXN</span>
                  <span className="text-red-400">{region.fraud_count} fraud</span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      region.avg_score >= 0.7 ? "bg-red-500" :
                      region.avg_score >= 0.4 ? "bg-amber-500" : "bg-green-500"
                    }`}
                    style={{ width: `${region.avg_score * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${
                  region.avg_score >= 0.7 ? "text-red-400" :
                  region.avg_score >= 0.4 ? "text-amber-400" : "text-green-400"
                }`}>
                  {(region.avg_score * 100).toFixed(0)}%
                </span>
                <p className="text-xs text-slate-500">risk</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const [mlStatus, setMlStatus] = useState<"checking" | "online" | "offline">("checking");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetch(`${ML_API_URL}/health`, { headers: { "ngrok-skip-browser-warning": "true" } })
      .then((r) => setMlStatus(r.ok ? "online" : "offline"))
      .catch(() => setMlStatus("offline"));
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      fetch(`${ML_API_URL}/health`, { headers: { "ngrok-skip-browser-warning": "true" } })
        .then((r) => setMlStatus(r.ok ? "online" : "offline"))
        .catch(() => setMlStatus("offline"));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar activePage="dashboard" />
      
      {/* Main Content */}
      <main className="ml-64">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 fixed top-0 right-0 left-64 z-40">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-white">Security Operations Center</h2>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-4 h-4" />
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <button 
                onClick={() => setLastUpdate(new Date())}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                <span className={`w-2 h-2 rounded-full ${
                  mlStatus === "online" ? "bg-green-400" : 
                  mlStatus === "offline" ? "bg-red-400" : "bg-yellow-400 animate-pulse"
                }`}></span>
                <span className="text-xs text-slate-300">
                  ML Service: {mlStatus === "checking" ? "Checking..." : mlStatus}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="pt-20 pb-8 px-6">
          {/* Fraud Spike Indicator */}
          <div className="mb-6">
            <FraudSpikeIndicator />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard 
              title="Total Transactions" 
              value="3,510" 
              change="+12%" 
              changeType="up" 
              icon={Activity}
              accentColor="bg-blue-600"
            />
            <KPICard 
              title="Fraud Detected" 
              value="283" 
              change="+5%" 
              changeType="up" 
              icon={AlertTriangle}
              accentColor="bg-red-600"
            />
            <KPICard 
              title="Fraud Rate" 
              value="8.1%" 
              change="-2%" 
              changeType="down" 
              icon={BarChart3}
              accentColor="bg-amber-600"
            />
            <KPICard 
              title="High-Risk Vendors" 
              value="3" 
              change="Same" 
              changeType="neutral" 
              icon={Users}
              accentColor="bg-purple-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Fraud Trend Chart */}
            <div className="lg:col-span-2">
              <FraudTrendChart />
            </div>

            {/* Risk Score Gauge */}
            <div className="lg:col-span-1">
              <RiskScoreGauge score={0.72} />
            </div>
          </div>

          {/* Alert Panel & Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AlertPanel />
            <ActivityFeed />
          </div>

          {/* Suspicious Transactions */}
          <div className="mb-6">
            <SuspiciousTransactionsTable />
          </div>

          {/* Geo Map & Vendor Ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GeoRiskMap />
            <VendorRiskRanking />
          </div>

          {/* Note */}
          <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <p className="text-sm text-cyan-300">
              <strong className="text-cyan-400">Phase 5 Note:</strong> This dashboard shows placeholder data.
              After uploading a CSV on the <Link href="/upload" className="underline hover:text-cyan-200">Upload page</Link>,
              real ML results from your Flask service will populate here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
