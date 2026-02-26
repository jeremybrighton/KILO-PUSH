<?php

namespace App\Http\Controllers;

/**
 * PHASE 3 — Authentication Controller
 * Handles user login, registration, logout, and password resets.
 * Role-based access is enforced via the RoleMiddleware.
 * Roles: admin | analyst | vendor
 */

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // ── Show login form ──────────────────────────
    public function showLogin()
    {
        return view('auth.login');
    }

    // ── Process login ────────────────────────────
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // Log successful login for audit trail
            AuditLog::record('login', 'User logged in', Auth::id());

            return redirect()->intended(route('dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    // ── Show registration form ───────────────────
    public function showRegister()
    {
        return view('auth.register');
    }

    // ── Process registration ─────────────────────
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => 'vendor', // Default role — admin promotes as needed
        ]);

        Auth::login($user);

        AuditLog::record('register', 'New user registered', $user->id);

        return redirect(route('dashboard'));
    }

    // ── Logout ───────────────────────────────────
    public function logout(Request $request)
    {
        AuditLog::record('logout', 'User logged out', Auth::id());

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect(route('login'));
    }

    // ── Show forgot password form ────────────────
    public function showForgotPassword()
    {
        return view('auth.forgot-password');
    }

    // ── Send password reset link ─────────────────
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? back()->with('status', __($status))
            : back()->withErrors(['email' => __($status)]);
    }

    // ── Show reset password form ─────────────────
    public function showResetForm(Request $request, string $token)
    {
        return view('auth.reset-password', ['token' => $token]);
    }

    // ── Process password reset ───────────────────
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => ['required'],
            'email'    => ['required', 'email'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('login')->with('status', __($status))
            : back()->withErrors(['email' => [__($status)]]);
    }
}
