import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Sparkles, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      const msg = signInError.message.toLowerCase();
      if (msg.includes('invalid login credentials')) {
        setError('Incorrect email or password. Please try again.');
      } else if (msg.includes('email not confirmed')) {
        setError('Your email has not been confirmed yet.');
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-sky-500/15 blur-[120px]" />
      </div>

      <header className="relative border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950 shadow-lg shadow-sky-500/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Intervu</span>
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md animate-[fadeUp_0.6s_ease-out]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 text-sky-300 ring-1 ring-inset ring-white/10">
                <LogIn className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-400">Sign in to continue your interview prep.</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 hover:shadow-sky-500/40 disabled:translate-y-0 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              No account yet?{' '}
              <Link to="/register" className="font-medium text-sky-300 transition hover:text-sky-200">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
