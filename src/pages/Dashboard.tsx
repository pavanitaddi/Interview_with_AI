import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  BarChart3,
  Trophy,
  TrendingUp,
  ArrowRight,
  LogOut,
  Loader2,
  AlertCircle,
  Video,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, type Session } from '../lib/supabase';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error: queryError } = await supabase
        .from('interview_sessions')
        .select('*')
        .order('started_at', { ascending: false });

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }
      setSessions((data ?? []) as Session[]);
      setLoading(false);
    }
    load();
  }, []);

  const completed = sessions.filter((s) => s.status === 'completed');
  const avgScore =
    completed.length > 0
      ? Math.round(completed.reduce((sum, s) => sum + (s.overall_score ?? 0), 0) / completed.length)
      : 0;
  const bestScore = completed.length > 0 ? Math.max(...completed.map((s) => s.overall_score ?? 0)) : 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950 shadow-lg shadow-sky-500/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Intervu</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-400 sm:inline">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        {/* Hero row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}.
            </h1>
            <p className="mt-2 text-slate-400">Track your progress and run your next mock interview.</p>
          </div>
          <button
            onClick={() => navigate('/interview')}
            className="group inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 hover:shadow-sky-500/40"
          >
            <Plus className="h-4 w-4" />
            New Interview
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Trophy className="h-5 w-5" />}
            label="Average score"
            value={loading ? '—' : `${avgScore}`}
            accent="from-sky-500/20 to-sky-500/5"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Best score"
            value={loading ? '—' : `${bestScore}`}
            accent="from-emerald-500/20 to-emerald-500/5"
          />
          <StatCard
            icon={<BarChart3 className="h-5 w-5" />}
            label="Sessions completed"
            value={loading ? '—' : `${completed.length}`}
            accent="from-amber-500/20 to-amber-500/5"
          />
        </div>

        {/* Sessions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white">Session history</h2>

          {loading && (
            <div className="mt-8 flex items-center justify-center py-16 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && sessions.length === 0 && (
            <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 text-sky-300 ring-1 ring-inset ring-white/10">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">No sessions yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                Run your first mock interview to see your performance history and trends here.
              </p>
              <button
                onClick={() => navigate('/interview')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                Start your first interview
              </button>
            </div>
          )}

          {!loading && !error && sessions.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Track</th>
                    <th className="hidden px-5 py-3 font-medium sm:table-cell">Date</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessions.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-4 font-medium text-white">{s.role}</td>
                      <td className="px-5 py-4 text-slate-300">
                        <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-xs capitalize text-slate-300">
                          {s.track}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 text-slate-400 sm:table-cell">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 opacity-60" />
                          {new Date(s.started_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {s.overall_score !== null ? (
                          <ScoreBadge score={s.overall_score} />
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {s.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            In progress
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {s.status === 'completed' ? (
                          <Link
                            to={`/report/${s.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 transition hover:text-sky-200"
                          >
                            View report
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <button
                            onClick={() => navigate('/interview')}
                            className="inline-flex items-center gap-1 text-xs font-medium text-amber-300 transition hover:text-amber-200"
                          >
                            Resume
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${accent} p-6`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white ring-1 ring-inset ring-white/10">
          {icon}
        </span>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-emerald-400 bg-emerald-500/10' : score >= 60 ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${color}`}>
      <Trophy className="h-3.5 w-3.5" />
      {score}
    </span>
  );
}
