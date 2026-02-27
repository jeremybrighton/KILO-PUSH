@extends('layouts.app')

@section('title', 'Settings - FraudGuard Security Control Center')

@section('content')
<div class="min-h-screen bg-slate-900 text-slate-200">
    <!-- Header -->
    <header class="bg-slate-800 border-b border-slate-700">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <a href="{{ route('dashboard') }}" class="text-slate-400 hover:text-white">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div>
                        <h1 class="text-xl font-bold text-white">Security Control Center</h1>
                        <p class="text-sm text-slate-400">FraudGuard Configuration & Governance</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-lg border border-green-500/30">
                        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        System Operational
                    </span>
                </div>
            </div>
        </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="bg-slate-800/50 border-b border-slate-700">
        <div class="max-w-7xl mx-auto px-6">
            <div class="flex gap-1 overflow-x-auto">
                <a href="{{ route('settings.index') }}" class="px-4 py-3 text-sm font-medium text-cyan-400 border-b-2 border-cyan-400 whitespace-nowrap">
                    Overview
                </a>
                <a href="{{ route('settings.thresholds') }}" class="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent whitespace-nowrap">
                    Risk Thresholds
                </a>
                <a href="{{ route('settings.alerts') }}" class="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent whitespace-nowrap">
                    Alert Controls
                </a>
                <a href="{{ route('settings.vendor-rules') }}" class="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent whitespace-nowrap">
                    Vendor Rules
                </a>
                <a href="{{ route('settings.users') }}" class="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent whitespace-nowrap">
                    User Management
                </a>
                <a href="{{ route('settings.audit-logs') }}" class="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent whitespace-nowrap">
                    Audit Logs
                </a>
                <a href="{{ route('settings.profile') }}" class="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent whitespace-nowrap">
                    Profile
                </a>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-6 py-8">
        @if(session('success'))
            <div class="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
                {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                {{ session('error') }}
            </div>
        @endif

        <!-- System Status Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <!-- Risk Thresholds Card -->
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/30 transition-colors">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 rounded-lg bg-cyan-500/20">
                        <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                    </div>
                    <h3 class="text-sm font-semibold text-white">Risk Thresholds</h3>
                </div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-slate-400">High Risk</span>
                        <span class="text-red-400 font-mono">{{ $thresholds['high_risk'] }}%</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Medium Risk</span>
                        <span class="text-amber-400 font-mono">{{ $thresholds['medium_risk'] }}%</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Low Risk</span>
                        <span class="text-green-400 font-mono">{{ $thresholds['low_risk'] }}%</span>
                    </div>
                </div>
            </div>

            <!-- Alert Status Card -->
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/30 transition-colors">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 rounded-lg bg-amber-500/20">
                        <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                        </svg>
                    </div>
                    <h3 class="text-sm font-semibold text-white">Alert Status</h3>
                </div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between items-center">
                        <span class="text-slate-400">Email Alerts</span>
                        <span class="{{ $alerts['email_enabled'] ? 'text-green-400' : 'text-slate-500' }}">
                            {{ $alerts['email_enabled'] ? 'Enabled' : 'Disabled' }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-slate-400">Slack Integration</span>
                        <span class="{{ $alerts['slack_enabled'] ? 'text-green-400' : 'text-slate-500' }}">
                            {{ $alerts['slack_enabled'] ? 'Enabled' : 'Disabled' }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-slate-400">Daily Reports</span>
                        <span class="{{ $alerts['daily_report'] ? 'text-green-400' : 'text-slate-500' }}">
                            {{ $alerts['daily_report'] ? 'Enabled' : 'Disabled' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Model Info Card -->
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/30 transition-colors">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 rounded-lg bg-purple-500/20">
                        <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                        </svg>
                    </div>
                    <h3 class="text-sm font-semibold text-white">ML Model</h3>
                </div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-slate-400">Version</span>
                        <span class="text-purple-400 font-mono">{{ $modelInfo['version'] }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Accuracy</span>
                        <span class="text-green-400 font-mono">{{ $modelInfo['accuracy'] }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Last Trained</span>
                        <span class="text-slate-300 font-mono">{{ $modelInfo['last_trained'] }}</span>
                    </div>
                </div>
            </div>

            <!-- API Status Card -->
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/30 transition-colors">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 rounded-lg bg-blue-500/20">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    </div>
                    <h3 class="text-sm font-semibold text-white">API Connection</h3>
                </div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-slate-400">Endpoint</span>
                        <span class="text-blue-400 text-xs truncate max-w-[120px]" title="{{ $apiConfig['endpoint'] }}">
                            {{ parse_url($apiConfig['endpoint'], PHP_URL_HOST) }}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Timeout</span>
                        <span class="text-slate-300 font-mono">{{ $apiConfig['timeout'] }}s</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Retries</span>
                        <span class="text-slate-300 font-mono">{{ $apiConfig['retries'] }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <!-- Risk Threshold Configuration -->
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div class="px-5 py-4 border-b border-slate-700 bg-slate-800/30">
                    <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                        <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        Risk Thresholds
                    </h3>
                    <p class="text-sm text-slate-400 mt-1">Configure fraud detection sensitivity levels</p>
                </div>
                <div class="p-5">
                    <form action="{{ route('settings.thresholds') }}" method="POST">
                        @csrf
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-2">
                                    High Risk Threshold
                                    <span class="text-red-400">*</span>
                                </label>
                                <div class="relative">
                                    <input type="number" name="high_risk" value="{{ $thresholds['high_risk'] }}" 
                                        min="50" max="100" required
                                        class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                                </div>
                                <p class="text-xs text-slate-500 mt-1">Transactions above this score are flagged as high risk</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-2">Medium Risk Threshold</label>
                                <div class="relative">
                                    <input type="number" name="medium_risk" value="{{ $thresholds['medium_risk'] }}" 
                                        min="30" max="90" required
                                        class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-2">Low Risk Threshold</label>
                                <div class="relative">
                                    <input type="number" name="low_risk" value="{{ $thresholds['low_risk'] }}" 
                                        min="10" max="70" required
                                        class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                                </div>
                            </div>
                            @if($user->role === 'admin')
                                <button type="submit" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-lg transition-colors">
                                    Update Thresholds
                                </button>
                            @else
                                <p class="text-xs text-amber-400 bg-amber-500/10 p-2 rounded">
                                    ⚠️ Only administrators can modify thresholds
                                </p>
                            @endif
                        </div>
                    </form>
                </div>
            </div>

            <!-- Alert Configuration -->
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div class="px-5 py-4 border-b border-slate-700 bg-slate-800/30">
                    <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                        <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                        </svg>
                        Alert Controls
                    </h3>
                    <p class="text-sm text-slate-400 mt-1">Configure notification preferences</p>
                </div>
                <div class="p-5">
                    <form action="{{ route('settings.alerts') }}" method="POST">
                        @csrf
                        <div class="space-y-4">
                            <label class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50">
                                <span class="text-sm text-slate-300">Email Alerts</span>
                                <input type="checkbox" name="email_enabled" value="1" {{ $alerts['email_enabled'] ? 'checked' : '' }}
                                    class="w-5 h-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-500">
                            </label>
                            <label class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50">
                                <span class="text-sm text-slate-300">Slack Integration</span>
                                <input type="checkbox" name="slack_enabled" value="1" {{ $alerts['slack_enabled'] ? 'checked' : '' }}
                                    class="w-5 h-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-500">
                            </label>
                            <label class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50">
                                <span class="text-sm text-slate-300">Daily Reports</span>
                                <input type="checkbox" name="daily_report" value="1" {{ $alerts['daily_report'] ? 'checked' : '' }}
                                    class="w-5 h-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-500">
                            </label>
                            <label class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50">
                                <span class="text-sm text-slate-300">Real-time Alerts</span>
                                <input type="checkbox" name="realtime_alerts" value="1" {{ $alerts['realtime_alerts'] ? 'checked' : '' }}
                                    class="w-5 h-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-500">
                            </label>
                            @if($user->role === 'admin')
                                <button type="submit" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-lg transition-colors">
                                    Save Alert Settings
                                </button>
                            @else
                                <p class="text-xs text-amber-400 bg-amber-500/10 p-2 rounded">
                                    ⚠️ Only administrators can modify alerts
                                </p>
                            @endif
                        </div>
                    </form>
                </div>
            </div>

            <!-- Vendor Monitoring -->
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div class="px-5 py-4 border-b border-slate-700 bg-slate-800/30">
                    <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                        <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        Vendor Rules
                    </h3>
                    <p class="text-sm text-slate-400 mt-1">Configure vendor monitoring policies</p>
                </div>
                <div class="p-5">
                    <form action="{{ route('settings.vendor-rules') }}" method="POST">
                        @csrf
                        <div class="space-y-4">
                            <label class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50">
                                <span class="text-sm text-slate-300">Geo Restrictions</span>
                                <input type="checkbox" name="geo_restrictions" value="1" {{ $vendorRules['geo_restrictions'] ? 'checked' : '' }}
                                    class="w-5 h-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-500">
                            </label>
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-2">Max Daily Limit ($)</label>
                                <input type="number" name="max_daily_limit" value="{{ $vendorRules['max_daily_limit'] }}" 
                                    min="1000" required
                                    class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-2">Frequency Sensitivity</label>
                                <select name="frequency_sensitivity" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                    <option value="low" {{ $vendorRules['frequency_sensitivity'] === 'low' ? 'selected' : '' }}>Low</option>
                                    <option value="medium" {{ $vendorRules['frequency_sensitivity'] === 'medium' ? 'selected' : '' }}>Medium</option>
                                    <option value="high" {{ $vendorRules['frequency_sensitivity'] === 'high' ? 'selected' : '' }}>High</option>
                                </select>
                            </div>
                            @if($user->role === 'admin')
                                <button type="submit" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-lg transition-colors">
                                    Save Vendor Rules
                                </button>
                            @else
                                <p class="text-xs text-amber-400 bg-amber-500/10 p-2 rounded">
                                    ⚠️ Only administrators can modify vendor rules
                                </p>
                            @endif
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Recent Audit Logs -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-700 bg-slate-800/30 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <h3 class="text-lg font-semibold text-white">Recent Activity</h3>
                </div>
                <a href="{{ route('settings.audit-logs') }}" class="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    View All <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-slate-800/50 text-slate-400 text-xs uppercase">
                        <tr>
                            <th class="px-5 py-3 text-left font-medium">Timestamp</th>
                            <th class="px-5 py-3 text-left font-medium">User</th>
                            <th class="px-5 py-3 text-left font-medium">Action</th>
                            <th class="px-5 py-3 text-left font-medium">Details</th>
                            <th class="px-5 py-3 text-left font-medium">IP Address</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700/30">
                        @forelse($recentAuditLogs as $log)
                            <tr class="hover:bg-slate-700/20">
                                <td class="px-5 py-3 text-slate-400 font-mono text-xs">
                                    {{ $log->created_at->format('Y-m-d H:i:s') }}
                                </td>
                                <td class="px-5 py-3 text-slate-300">
                                    {{ $log->user->name ?? 'System' }}
                                </td>
                                <td class="px-5 py-3">
                                    <span class="px-2 py-1 rounded text-xs font-medium {{
                                        $log->action === 'threshold_update' ? 'bg-cyan-500/20 text-cyan-400' :
                                        ($log->action === 'alert_settings_update' ? 'bg-amber-500/20 text-amber-400' :
                                        ($log->action === 'role_change' ? 'bg-purple-500/20 text-purple-400' :
                                        'bg-slate-700 text-slate-400'))
                                    }}">
                                        {{ str_replace('_', ' ', ucfirst($log->action)) }}
                                    </span>
                                </td>
                                <td class="px-5 py-3 text-slate-400 max-w-xs truncate">
                                    {{ $log->entity_type }}:{{ $log->entity_id }}
                                </td>
                                <td class="px-5 py-3 text-slate-500 font-mono text-xs">
                                    {{ $log->ip_address }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="px-5 py-8 text-center text-slate-500">
                                    No recent activity logs found.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</div>
@endsection
