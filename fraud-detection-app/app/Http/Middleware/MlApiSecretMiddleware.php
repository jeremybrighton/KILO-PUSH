<?php

namespace App\Http\Middleware;

/**
 * PHASE 4 — ML API Secret Middleware
 * Validates the shared secret header on internal API routes.
 * Prevents unauthorized access to the ML callback endpoints.
 *
 * Python ML service must include header: X-ML-Secret: {ML_SERVICE_SECRET}
 * Register as 'api.secret' in app/Http/Kernel.php
 */

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MlApiSecretMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('services.ml.secret');

        if (empty($secret) || $request->header('X-ML-Secret') !== $secret) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
