<?php

namespace App\Http\Middleware;

/**
 * PHASE 3 — Role Middleware
 * Enforces role-based access control on routes.
 * Usage in routes: ->middleware('role:admin') or ->middleware('role:admin,analyst')
 *
 * Register in app/Http/Kernel.php under $routeMiddleware:
 *   'role' => \App\Http\Middleware\RoleMiddleware::class,
 */

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        if (!$request->user()->hasRole(...$roles)) {
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
