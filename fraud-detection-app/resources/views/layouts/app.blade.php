<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Fraud Detection System')</title>

    {{-- Tailwind CSS CDN (replace with compiled asset in production) --}}
    <script src="https://cdn.tailwindcss.com"></script>

    {{-- Chart.js for Phase 5 dashboards --}}
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

    {{-- Leaflet.js for geo maps (Phase 5) --}}
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    @stack('styles')
</head>
<body class="bg-gray-100 min-h-screen">

    {{-- Navigation --}}
    <nav class="bg-gray-900 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center space-x-8">
                    <a href="{{ route('dashboard') }}" class="text-xl font-bold text-blue-400">
                        🛡️ FraudGuard
                    </a>
                    @auth
                    <div class="hidden md:flex space-x-4">
                        <a href="{{ route('dashboard') }}" class="hover:text-blue-300 text-sm">Dashboard</a>
                        <a href="{{ route('datasets.index') }}" class="hover:text-blue-300 text-sm">Datasets</a>
                        @if(auth()->user()->hasRole('admin', 'analyst'))
                        <a href="{{ route('jobs.index') }}" class="hover:text-blue-300 text-sm">Jobs</a>
                        <a href="{{ route('analytics.fraud-map') }}" class="hover:text-blue-300 text-sm">Analytics</a>
                        <a href="{{ route('analytics.reports') }}" class="hover:text-blue-300 text-sm">Reports</a>
                        @endif
                        @if(auth()->user()->isAdmin())
                        <a href="{{ route('admin.index') }}" class="hover:text-blue-300 text-sm">Admin</a>
                        @endif
                    </div>
                    @endauth
                </div>
                @auth
                <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-400">
                        {{ auth()->user()->name }}
                        <span class="ml-1 px-2 py-0.5 rounded text-xs
                            {{ auth()->user()->isAdmin() ? 'bg-red-700' : (auth()->user()->isAnalyst() ? 'bg-blue-700' : 'bg-green-700') }}">
                            {{ ucfirst(auth()->user()->role) }}
                        </span>
                    </span>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="text-sm text-gray-400 hover:text-white">Logout</button>
                    </form>
                </div>
                @endauth
            </div>
        </div>
    </nav>

    {{-- Flash Messages --}}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        @if(session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ session('success') }}
        </div>
        @endif
        @if(session('error'))
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ session('error') }}
        </div>
        @endif
        @if($errors->any())
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <ul class="list-disc list-inside">
                @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
        @endif
    </div>

    {{-- Main Content --}}
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        @yield('content')
    </main>

    @stack('scripts')
</body>
</html>
