{{-- PHASE 3 — Dataset Upload View --}}
@extends('layouts.app')

@section('title', 'Upload Dataset — FraudGuard')

@section('content')
<div class="max-w-2xl mx-auto">
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Upload Dataset</h1>
        <p class="text-gray-500">Upload a CSV file for fraud detection analysis. Processing will begin automatically.</p>
    </div>

    <div class="bg-white rounded-xl shadow p-8">
        <form method="POST" action="{{ route('datasets.store') }}" enctype="multipart/form-data">
            @csrf

            {{-- Dataset Label --}}
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Dataset Label <span class="text-red-500">*</span>
                </label>
                <input type="text" name="label" value="{{ old('label') }}" required
                    placeholder="e.g. Q1 2024 Vendor Transactions"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <p class="text-xs text-gray-400 mt-1">A descriptive name to identify this dataset</p>
            </div>

            {{-- Description --}}
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea name="description" rows="3"
                    placeholder="Additional notes about this dataset..."
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">{{ old('description') }}</textarea>
            </div>

            {{-- File Upload --}}
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    CSV File <span class="text-red-500">*</span>
                </label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition"
                    id="drop-zone">
                    <div class="text-4xl mb-3">📄</div>
                    <p class="text-gray-600 mb-2">Drag and drop your CSV file here, or</p>
                    <label class="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Browse Files
                        <input type="file" name="dataset" accept=".csv,.txt" class="hidden" id="file-input">
                    </label>
                    <p class="text-xs text-gray-400 mt-3">CSV format only · Maximum 50MB</p>
                    <p id="file-name" class="text-sm text-blue-600 mt-2 hidden"></p>
                </div>
            </div>

            {{-- Expected CSV Format --}}
            <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p class="text-sm font-medium text-blue-800 mb-2">📋 Expected CSV Format</p>
                <code class="text-xs text-blue-700">
                    transaction_id, vendor_id, vendor_name, amount, region, timestamp, ...
                </code>
                <p class="text-xs text-blue-600 mt-1">
                    The Python ML service will process all columns. Ensure transaction_id is unique.
                </p>
            </div>

            <div class="flex gap-4">
                <button type="submit"
                    class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium">
                    Upload & Queue for Processing
                </button>
                <a href="{{ route('datasets.index') }}"
                    class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Cancel
                </a>
            </div>
        </form>
    </div>

    {{-- What happens next --}}
    <div class="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 class="font-medium text-gray-900 mb-3">What happens after upload?</h3>
        <ol class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start gap-2">
                <span class="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                File is stored securely and metadata is logged
            </li>
            <li class="flex items-start gap-2">
                <span class="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                A background job is queued to send the dataset to the ML service
            </li>
            <li class="flex items-start gap-2">
                <span class="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                Python ML service processes the data and returns fraud scores
            </li>
            <li class="flex items-start gap-2">
                <span class="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                Results appear in the Analytics dashboard automatically
            </li>
        </ol>
    </div>
</div>
@endsection

@push('scripts')
<script>
// Show selected filename
document.getElementById('file-input').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name;
    if (fileName) {
        const el = document.getElementById('file-name');
        el.textContent = '✓ ' + fileName;
        el.classList.remove('hidden');
    }
});
</script>
@endpush
