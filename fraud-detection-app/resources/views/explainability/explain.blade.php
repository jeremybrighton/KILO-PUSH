{{-- PHASE 6 — Transaction Explainability View --}}
@extends('layouts.app')

@section('title', 'Transaction Explanation — FraudGuard')

@section('content')
<div class="mb-6">
    <a href="{{ url()->previous() }}" class="text-blue-600 hover:underline text-sm">← Back</a>
    <h1 class="text-2xl font-bold text-gray-900 mt-2">🔍 Transaction Explanation</h1>
    <p class="text-gray-500">Why was transaction #{{ $transaction->transaction_id }} flagged?</p>
</div>

@if($explanation)
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    {{-- Left: Transaction Details --}}
    <div class="lg:col-span-1 space-y-4">
        <div class="bg-white rounded-xl shadow p-6">
            <h2 class="font-bold text-gray-900 mb-4">Transaction Details</h2>
            <dl class="space-y-3 text-sm">
                <div class="flex justify-between">
                    <dt class="text-gray-500">Transaction ID</dt>
                    <dd class="font-mono text-gray-900">{{ $transaction->transaction_id }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-500">Fraud Score</dt>
                    <dd class="font-bold text-red-600">
                        {{ number_format($transaction->fraudResult?->fraud_score * 100, 1) }}%
                    </dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-500">Status</dt>
                    <dd>
                        @if($transaction->fraudResult?->is_fraud)
                        <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">🚨 Flagged</span>
                        @else
                        <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">✓ Clean</span>
                        @endif
                    </dd>
                </div>
                @if($transaction->fraudResult?->vendor_name)
                <div class="flex justify-between">
                    <dt class="text-gray-500">Vendor</dt>
                    <dd class="text-gray-900">{{ $transaction->fraudResult->vendor_name }}</dd>
                </div>
                @endif
                @if($transaction->fraudResult?->region)
                <div class="flex justify-between">
                    <dt class="text-gray-500">Region</dt>
                    <dd class="text-gray-900">{{ $transaction->fraudResult->region }}</dd>
                </div>
                @endif
                @if($transaction->fraudResult?->amount)
                <div class="flex justify-between">
                    <dt class="text-gray-500">Amount</dt>
                    <dd class="font-medium text-gray-900">£{{ number_format($transaction->fraudResult->amount, 2) }}</dd>
                </div>
                @endif
            </dl>
        </div>

        {{-- Risk Gauge --}}
        <div class="bg-white rounded-xl shadow p-6 text-center">
            <h3 class="font-bold text-gray-900 mb-4">Risk Level</h3>
            @php $score = $transaction->fraudResult?->fraud_score ?? 0; @endphp
            <div class="relative w-32 h-32 mx-auto mb-3">
                <svg viewBox="0 0 36 36" class="w-32 h-32 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                    <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke="{{ $score >= 0.7 ? '#ef4444' : ($score >= 0.4 ? '#f59e0b' : '#10b981') }}"
                        stroke-width="3"
                        stroke-dasharray="{{ $score * 100 }} 100"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-2xl font-bold {{ $score >= 0.7 ? 'text-red-600' : ($score >= 0.4 ? 'text-yellow-600' : 'text-green-600') }}">
                        {{ number_format($score * 100, 0) }}%
                    </span>
                </div>
            </div>
            <p class="text-sm font-medium
                {{ $score >= 0.7 ? 'text-red-600' : ($score >= 0.4 ? 'text-yellow-600' : 'text-green-600') }}">
                {{ $score >= 0.8 ? 'Critical Risk' : ($score >= 0.6 ? 'High Risk' : ($score >= 0.4 ? 'Medium Risk' : 'Low Risk')) }}
            </p>
        </div>
    </div>

    {{-- Right: Explanation --}}
    <div class="lg:col-span-2 space-y-4">

        {{-- Human-readable narrative --}}
        <div class="bg-white rounded-xl shadow p-6">
            <h2 class="font-bold text-gray-900 mb-3">📝 Plain English Explanation</h2>
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p class="text-gray-800 leading-relaxed">{{ $explanation['narrative'] }}</p>
            </div>
        </div>

        {{-- Feature importance chart --}}
        <div class="bg-white rounded-xl shadow p-6">
            <h2 class="font-bold text-gray-900 mb-4">📊 Feature Impact (SHAP Values)</h2>
            <p class="text-sm text-gray-500 mb-4">
                Positive values (red) increase fraud risk. Negative values (green) reduce it.
            </p>
            <canvas id="shapChart" height="150"></canvas>
        </div>

        {{-- Risk factors --}}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="font-bold text-red-700 mb-3">🔴 Risk Factors</h3>
                <ul class="space-y-2">
                    @foreach($explanation['risk_increasing'] as $feature)
                    <li class="flex items-center justify-between text-sm">
                        <span class="text-gray-700">{{ str_replace('_', ' ', ucfirst($feature['name'])) }}</span>
                        <span class="text-red-600 font-medium">+{{ number_format($feature['impact'], 3) }}</span>
                    </li>
                    @endforeach
                    @if(empty($explanation['risk_increasing']))
                    <li class="text-gray-400 text-sm">No significant risk factors</li>
                    @endif
                </ul>
            </div>
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="font-bold text-green-700 mb-3">🟢 Mitigating Factors</h3>
                <ul class="space-y-2">
                    @foreach($explanation['risk_decreasing'] as $feature)
                    <li class="flex items-center justify-between text-sm">
                        <span class="text-gray-700">{{ str_replace('_', ' ', ucfirst($feature['name'])) }}</span>
                        <span class="text-green-600 font-medium">{{ number_format($feature['impact'], 3) }}</span>
                    </li>
                    @endforeach
                    @if(empty($explanation['risk_decreasing']))
                    <li class="text-gray-400 text-sm">No mitigating factors</li>
                    @endif
                </ul>
            </div>
        </div>
    </div>
</div>

@else
<div class="bg-white rounded-xl shadow p-12 text-center">
    <div class="text-5xl mb-4">🔍</div>
    <h2 class="text-xl font-bold text-gray-900 mb-2">No Explanation Available</h2>
    <p class="text-gray-500">
        SHAP explanations for this transaction have not been generated yet.
        They are created automatically after ML processing completes.
    </p>
</div>
@endif
@endsection

@push('scripts')
@if($explanation && !empty($explanation['top_features']))
<script>
const features = @json($explanation['top_features']);
const labels = features.map(f => f.name.replace(/_/g, ' '));
const impacts = features.map(f => f.impact);
const colors = impacts.map(v => v > 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)');

const ctx = document.getElementById('shapChart').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: 'SHAP Impact',
            data: impacts,
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace('0.7', '1')),
            borderWidth: 1,
        }]
    },
    options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: ctx => `Impact: ${ctx.raw > 0 ? '+' : ''}${ctx.raw.toFixed(4)}`
                }
            }
        },
        scales: {
            x: {
                title: { display: true, text: 'SHAP Value (impact on fraud score)' }
            }
        }
    }
});
</script>
@endif
@endpush
