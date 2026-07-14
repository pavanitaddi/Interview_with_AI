import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  LogOut,
  Loader2,
  AlertCircle,
  Trophy,
  Mic,
  Brain,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, type Session, type SessionQuestion } from '../lib/supabase';

export default function Report() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    async function load() {
      const [sessionRes, questionsRes] = await Promise.all([
        supabase.from('interview_sessions').select('*').eq('id', sessionId).maybeSingle(),
        supabase
          .from('session_questions')
          .select('*')
          .eq('session_id', sessionId)
          .order('question_order', { ascending: true }),
      ]);

      if (sessionRes.error) {
        setError(sessionRes.error.message);
        setLoading(false);
        return;
      }
      if (!sessionRes.data) {
        setError('Session not found.');
        setLoading(false);
        return;
      }
      if (questionsRes.error) {
        setError(questionsRes.error.message);
        setLoading(false);
        return;
      }

      setSession(sessionRes.data as Session);
      setQuestions((questionsRes.data ?? []) as SessionQuestion[]);
      setLoading(false);
    }
    load();
  }, [sessionId]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const formatTime = (s: number | null) => {
    if (s === null) return '—';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h1 className="text-xl font-semibold text-white">{error ?? 'Session not found'}</h1>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
    );
  }

  const scoreMetrics = [
    {
      icon: <Brain className="h-5 w-5" />,
      label: 'Content',
      score: session.content_score ?? 0,
      description: 'Answer quality, structure and keyword coverage.',
    },
    {
      icon: <Mic className="h-5 w-5" />,
      label: 'Delivery',
      score: session.delivery_score ?? 0,
      description: 'Length, completeness and clarity of responses.',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: 'Composure',
      score: session.composure_score ?? 0,
      description: 'Pacing and time management under pressure.',
    },
  ];

  const avgTime =
    questions.length > 0
      ? Math.round(
          questions.reduce((sum, q) => sum + (q.time_taken_sec ?? 0), 0) / questions.length,
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <header className="relative border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950 shadow-lg shadow-sky-500/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Intervu</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-400 sm:inline">{user?.email}</span>
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

      <main className="relative mx-auto max-w-5xl px-6 py-10">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        {/* Hero score */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/10 via-slate-900 to-emerald-500/10 p-8 sm:p-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-sky-400">
                <span className="capitalize">{session.track}</span>
                <span className="text-slate-600">·</span>
                <span>{session.role}</span>
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your interview report
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {new Date(session.started_at).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                · {questions.length} questions · avg {formatTime(avgTime)} per question
              </p>
            </div>
            <ScoreRing score={session.overall_score ?? 0} />
          </div>
        </div>

        {/* Score breakdown */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {scoreMetrics.map((m) => (
            <ScoreMetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Question-by-question breakdown */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white">Question breakdown</h2>
          <div className="mt-6 space-y-4">
            {questions.map((q, i) => (
              <QuestionBreakdown key={q.id} index={i} q={q} formatTime={formatTime} />
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-lg font-semibold text-white">Recommended next steps</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {nextSteps(session).map((step) => (
              <li key={step} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                {step}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/interview')}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5"
            >
              <RotateCcw className="h-4 w-4" />
              Run another interview
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              View all sessions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';

  return (
    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs uppercase tracking-wide text-slate-400">overall</span>
      </div>
    </div>
  );
}

function ScoreMetricCard({
  icon,
  label,
  score,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  description: string;
}) {
  const color =
    score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
  const barColor =
    score >= 80 ? 'from-emerald-500 to-emerald-400' : score >= 60 ? 'from-amber-500 to-amber-400' : 'from-red-500 to-red-400';

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sky-300 ring-1 ring-inset ring-white/10">
          {icon}
        </span>
        <div>
          <div className={`text-2xl font-bold ${color}`}>{score}</div>
          <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
        </div>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

function QuestionBreakdown({
  index,
  q,
  formatTime,
}: {
  index: number;
  q: SessionQuestion;
  formatTime: (s: number | null) => string;
}) {
  const answered = q.answer_text && q.answer_text.trim().length > 0;
  const color =
    q.score === null ? 'text-slate-500' : q.score >= 80 ? 'text-emerald-400' : q.score >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-white/5 text-[10px] font-semibold text-slate-400">
              {index + 1}
            </span>
            Question
          </div>
          <h3 className="mt-2 font-medium leading-snug text-white">{q.question_text}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className={`inline-flex items-center gap-1 text-sm font-semibold ${color}`}>
            <Trophy className="h-4 w-4" />
            {q.score ?? '—'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(q.time_taken_sec)}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-white/5 pt-4">
        <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">Your answer</div>
        {answered ? (
          <p className="text-sm leading-relaxed text-slate-300">{q.answer_text}</p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm italic text-slate-500">
            <XCircle className="h-4 w-4" />
            No answer submitted
          </p>
        )}
      </div>

      {q.feedback && (
        <div className="mt-4 rounded-lg border border-sky-500/15 bg-sky-500/5 px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            Feedback
          </div>
          <p className="text-sm leading-relaxed text-slate-300">{q.feedback}</p>
        </div>
      )}
    </div>
  );
}

function nextSteps(session: Session): string[] {
  const steps: string[] = [];
  if ((session.content_score ?? 0) < 70) {
    steps.push('Practice the STAR method for behavioral answers to strengthen content structure.');
    steps.push('Prepare 2-3 concrete stories with measurable outcomes you can reuse across questions.');
  }
  if ((session.delivery_score ?? 0) < 70) {
    steps.push('Aim for fuller answers — target 100+ words with specific details rather than summaries.');
  }
  if ((session.composure_score ?? 0) < 70) {
    steps.push('Work on pacing — practice pausing to collect thoughts instead of rushing or over-running.');
  }
  if (steps.length === 0) {
    steps.push('Strong performance across the board — keep practicing to maintain consistency.');
    steps.push('Try a different track to broaden your preparation.');
  }
  return steps;
}
