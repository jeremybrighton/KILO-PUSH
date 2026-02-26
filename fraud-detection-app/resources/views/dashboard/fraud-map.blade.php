{{-- PHASE 5 — Geo Fraud Risk Map --}}
@extends('layouts.app')

@section('title', 'Geo Fraud Map — FraudGuard')

@section('content')
<div class="mb-6 flex justify-between items-center">
    <div>
        <h1 class="text-2xl font-bold text-gray-900">🗺️ Geo Fraud Risk Map</h1>
        <p class="text-gray-500">Geographic distribution of fraud risk scores</p>
    </div>
    <a href="{{ route('analytics.vendor-risk') }}" class="text-blue-600 hover:underline text-sm">
        View Vendor Risk →
    </a>
</div>

{{-- Summary Cards --}}
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    @foreach($geoData->take(3) as $region)
    <div class="bg-white rounded-xl shadow p-4">
        <div class="flex justify-between items-start">
            <div>
                <p class="font-medium text-gray-900">{{ $region->region ?? 'Unknown' }}</p>
                <p class="text-2xl font-bold text-red-600">{{ number_format($region->avg_score * 100, 1) }}%</p>
                <p class="text-xs text-gray-500">avg risk score</p>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500">{{ number_format($region->transaction_count) }} txns</p>
                <p class="text-sm text-red-500">{{ number_format($region->fraud_count) }} flagged</p>
            </div>
        </div>
    </div>
    @endforeach
</div>

{{-- Interactive Map Placeholder --}}
<div class="bg-white rounded-xl shadow mb-6">
    <div class="p-4 border-b border-gray-200">
        <h2 class="font-bold text-gray-900">Interactive Risk Map</h2>
        <p class="text-sm text-gray-500">Darker regions indicate higher fraud risk</p>
    </div>
    <div id="fraud-map" class="h-96 rounded-b-xl"></div>
</div>

{{-- Region Risk Table --}}
<div class="bg-white rounded-xl shadow">
    <div class="p-4 border-b border-gray-200">
        <h2 class="font-bold text-gray-900">Risk by Region</h2>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-gray-50">
                <tr>
                    <th class="text-left px-4 py-3 text-gray-600">Region</th>
                    <th class="text-right px-4 py-3 text-gray-600">Transactions</th>
                    <th class="text-right px-4 py-3 text-gray-600">Fraud Count</th>
                    <th class="text-right px-4 py-3 text-gray-600">Avg Risk Score</th>
                    <th class="text-left px-4 py-3 text-gray-600">Risk Level</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                @forelse($geoData as $region)
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium">{{ $region->region ?? 'Unknown' }}</td>
                    <td class="px-4 py-3 text-right">{{ number_format($region->transaction_count) }}</td>
                    <td class="px-4 py-3 text-right text-red-600">{{ number_format($region->fraud_count) }}</td>
                    <td class="px-4 py-3 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <div class="w-24 bg-gray-200 rounded-full h-2">
                                <div class="h-2 rounded-full
                                    {{ $region->avg_score >= 0.7 ? 'bg-red-500' : ($region->avg_score >= 0.4 ? 'bg-yellow-500' : 'bg-green-500') }}"
                                    style="width: {{ $region->avg_score * 100 }}%"></div>
                            </div>
                            {{ number_format($region->avg_score * 100, 1) }}%
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded text-xs font-medium
                            {{ $region->avg_score >= 0.7 ? 'bg-red-100 text-red-700' :
                               ($region->avg_score >= 0.4 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700') }}">
                            {{ $region->avg_score >= 0.7 ? 'High' : ($region->avg_score >= 0.4 ? 'Medium' : 'Low') }}
                        </span>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                        No fraud data available yet. Upload and process a dataset first.
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection

@push('scripts')
<script>
// Initialize Leaflet map
const map = L.map('fraud-map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Geo data from Laravel — plot fraud risk circles
const geoData = @json($geoData);

// TODO: Map region names to lat/lng coordinates
// For now, add placeholder markers
// In production, join with a geo-coordinates lookup table
geoData.forEach(region => {
    if (region.avg_score > 0.5) {
        // High-risk regions shown as red circles
        // Replace with actual coordinates from your data
        console.log('High risk region:', region.region, 'Score:', region.avg_score);
    }
});
</script>
@endpush
