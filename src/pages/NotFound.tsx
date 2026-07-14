import { Link } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950 shadow-lg shadow-sky-500/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Intervu</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 text-sky-300 ring-1 ring-inset ring-white/10">
            <Compass className="h-9 w-9" />
          </div>
          <p className="text-6xl font-bold tracking-tight text-white">404</p>
          <h1 className="mt-4 text-2xl font-semibold text-white">Page not found</h1>
          <p className="mx-auto mt-3 max-w-sm text-base text-slate-400">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
