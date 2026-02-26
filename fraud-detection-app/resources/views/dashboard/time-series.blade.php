{{-- PHASE 5 — Time-Series Anomaly Graph --}}
@extends('layouts.app')

@section('title', 'Time-Series Analysis — FraudGuard')

@section('content')
<div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">📈 Time-Series Fraud Analysis</h1>
    <p class="text-gray-500">Daily fraud trends and anomaly detection over the last 90 days</p>
</div>

{{-- Chart.js Time-Series Chart --}}
<div class="bg-white rounded-xl shadow p-6 mb-6">
    <div class="flex justify-between items-center mb-4">
        <h2 class="font-bold text-gray-900">Daily Fraud Count & Average Risk Score</h2>
        <div class="flex gap-4 text-sm">
            <span class="flex items-center gap-1"><span class="w-3 h-3 bg-red-500 rounded-full inline-block"></span> Fraud Count</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 bg-blue-500 rounded-full inline-block"></span> Avg Risk Score</span>
        </div>
    </div>
    <canvas id="timeSeriesChart" height="100"></canvas>
</div>

{{-- Anomaly Spikes Table --}}
<div class="bg-white rounded-xl shadow">
    <div class="p-4 border-b border-gray-200">
        <h2 class="font-bold text-gray-900">Notable Anomaly Dates</h2>
        <p class="text-sm text-gray-500">Days with significantly elevated fraud activity</p>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-gray-50">
                <tr>
                    <th class="text-left px-4 py-3 text-gray-600">Date</th>
                    <th class="text-right px-4 py-3 text-gray-600">Total Transactions</th>
                    <th class="text-right px-4 py-3 text-gray-600">Fraud Count</th>
                    <th class="text-right px-4 py-3 text-gray-600">Fraud Rate</th>
                    <th class="text-right px-4 py-3 text-gray-600">Avg Risk Score</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                @forelse($timeSeries->where('fraud_count', '>', 0)->sortByDesc('fraud_count')->take(10) as $day)
                <tr class="hover:bg-gray-50 {{ $day->avg_score > 0.7 ? 'bg-red-50' : '' }}">
                    <td class="px-4 py-3 font-medium">{{ $day->date }}</td>
                    <td class="px-4 py-3 text-right">{{ number_format($day->total) }}</td>
                    <td class="px-4 py-3 text-right text-red-600 font-medium">{{ number_format($day->fraud_count) }}</td>
                    <td class="px-4 py-3 text-right">
                        {{ $day->total > 0 ? number_format(($day->fraud_count / $day->total) * 100, 1) : 0 }}%
                    </td>
                    <td class="px-4 py-3 text-right">{{ number_format($day->avg_score * 100, 1) }}%</td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                        No time-series data available yet.
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
// Time-series data from Laravel controller
const timeSeriesData = @json($timeSeries);

const labels = timeSeriesData.map(d => d.date);
const fraudCounts = timeSeriesData.map(d => d.fraud_count);
const avgScores = timeSeriesData.map(d => (d.avg_score * 100).toFixed(2));

const ctx = document.getElementById('timeSeriesChart').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label: 'Fraud Count',
                data: fraudCounts,
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.3,
                yAxisID: 'y',
            },
            {
                label: 'Avg Risk Score (%)',
                data: avgScores,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: false,
                tension: 0.3,
                yAxisID: 'y1',
            }
        ]
    },
    options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Fraud Count' }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: { display: true, text: 'Risk Score (%)' },
                grid: { drawOnChartArea: false },
            }
        }
    }
});
</script>
@endpush
