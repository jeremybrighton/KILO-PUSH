{{-- PHASE 3/5 — Main Dashboard View --}}
@extends('layouts.app')

@section('title', 'Dashboard — FraudGuard')

@section('content')
<div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
    <p class="text-gray-500">Welcome back, {{ auth()->user()->name }}</p>
</div>

{{-- Stats Cards --}}
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Total Datasets</p>
                <p class="text-3xl font-bold text-gray-900">{{ $stats['total_datasets'] }}</p>
            </div>
            <div class="text-4xl">📁</div>
        </div>
    </div>
    <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Pending Jobs</p>
                <p class="text-3xl font-bold text-yellow-600">{{ $stats['pending_jobs'] }}</p>
            </div>
            <div class="text-4xl">⏳</div>
        </div>
    </div>
    <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Flagged Today</p>
                <p class="text-3xl font-bold text-red-600">{{ $stats['flagged_today'] }}</p>
            </div>
            <div class="text-4xl">🚨</div>
        </div>
    </div>
    <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">High-Risk Vendors</p>
                <p class="text-3xl font-bold text-orange-600">{{ $stats['high_risk_vendors'] }}</p>
            </div>
            <div class="text-4xl">⚠️</div>
        </div>
    </div>
</div>

{{-- Analytics Quick Links (Phase 5) --}}
@if(auth()->user()->hasRole('admin', 'analyst'))
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <a href="{{ route('analytics.fraud-map') }}"
        class="bg-blue-600 text-white rounded-xl shadow p-6 hover:bg-blue-700 transition">
        <div class="text-3xl mb-2">🗺️</div>
        <h3 class="font-bold text-lg">Geo Fraud Map</h3>
        <p class="text-blue-200 text-sm">View fraud risk by region</p>
    </a>
    <a href="{{ route('analytics.vendor-risk') }}"
        class="bg-orange-600 text-white rounded-xl shadow p-6 hover:bg-orange-700 transition">
        <div class="text-3xl mb-2">🏢</div>
        <h3 class="font-bold text-lg">Vendor Risk Rankings</h3>
        <p class="text-orange-200 text-sm">Identify high-risk vendors</p>
    </a>
    <a href="{{ route('analytics.time-series') }}"
        class="bg-purple-600 text-white rounded-xl shadow p-6 hover:bg-purple-700 transition">
        <div class="text-3xl mb-2">📈</div>
        <h3 class="font-bold text-lg">Time-Series Analysis</h3>
        <p class="text-purple-200 text-sm">Track fraud trends over time</p>
    </a>
</div>
@endif

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {{-- Recent Datasets --}}
    <div class="bg-white rounded-xl shadow">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 class="font-bold text-gray-900">Recent Datasets</h2>
            <a href="{{ route('datasets.index') }}" class="text-blue-600 text-sm hover:underline">View all</a>
        </div>
        <div class="divide-y divide-gray-100">
            @forelse($recentDatasets as $dataset)
            <div class="p-4 flex items-center justify-between">
                <div>
                    <p class="font-medium text-gray-900">{{ $dataset->label }}</p>
                    <p class="text-sm text-gray-500">{{ $dataset->filename }} · {{ $dataset->size_formatted }}</p>
                </div>
                <span class="px-2 py-1 rounded text-xs font-medium
                    {{ $dataset->status === 'processed' ? 'bg-green-100 text-green-700' :
                       ($dataset->status === 'failed' ? 'bg-red-100 text-red-700' :
                       ($dataset->status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700')) }}">
                    {{ ucfirst($dataset->status) }}
                </span>
            </div>
            @empty
            <div class="p-6 text-center text-gray-500">
                No datasets yet.
                <a href="{{ route('datasets.upload') }}" class="text-blue-600 hover:underline">Upload one</a>
            </div>
            @endforelse
        </div>
    </div>

    {{-- Recent Jobs --}}
    <div class="bg-white rounded-xl shadow">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 class="font-bold text-gray-900">Recent Processing Jobs</h2>
            @if(auth()->user()->hasRole('admin', 'analyst'))
            <a href="{{ route('jobs.index') }}" class="text-blue-600 text-sm hover:underline">View all</a>
            @endif
        </div>
        <div class="divide-y divide-gray-100">
            @forelse($recentJobs as $job)
            <div class="p-4 flex items-center justify-between">
                <div>
                    <p class="font-medium text-gray-900">Dataset #{{ $job->dataset_id }}</p>
                    <p class="text-sm text-gray-500">{{ $job->created_at->diffForHumans() }}</p>
                </div>
                <span class="px-2 py-1 rounded text-xs font-medium
                    bg-{{ $job->status_badge_color }}-100 text-{{ $job->status_badge_color }}-700">
                    {{ ucfirst($job->status) }}
                </span>
            </div>
            @empty
            <div class="p-6 text-center text-gray-500">No jobs yet.</div>
            @endforelse
        </div>
    </div>
</div>
@endsection
