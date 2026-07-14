import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  LogOut,
  Mic,
  MicOff,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  Lightbulb,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { tracks, roles, type InterviewQuestion } from '../lib/questionBank';

type Phase = 'setup' | 'active' | 'submitting';

type Answer = {
  question: InterviewQuestion;
  text: string;
  timeTakenSec: number;
  score: number;
  feedback: string;
};

const QUESTION_TIME_LIMIT = 180;

export default function Interview() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('setup');
  const [role, setRole] = useState(roles[0]);
  const [trackId, setTrackId] = useState(tracks[0].id);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [draft, setDraft] = useState('');
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [recording, setRecording] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef<number>(Date.now());

  const track = tracks.find((t) => t.id === trackId)!;
  const question = track.questions[currentIdx];
  const progress = ((currentIdx + (phase === 'active' ? 0 : 1)) / track.questions.length) * 100;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    questionStartRef.current = Date.now();
    setTimeLeft(QUESTION_TIME_LIMIT);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const beginInterview = () => {
    setPhase('active');
    setCurrentIdx(0);
    setAnswers([]);
    setDraft('');
    setShowHint(false);
    setError(null);
    startTimer();
  };

  const scoreAnswer = (q: InterviewQuestion, text: string, timeSec: number): { score: number; feedback: string } => {
    const lower = text.toLowerCase();
    const hits = q.idealKeywords.filter((k) => lower.includes(k));
    const keywordScore = Math.min(100, (hits.length / q.idealKeywords.length) * 100);

    const lengthScore = Math.min(100, (text.trim().split(/\s+/).length / 120) * 100);

    const timeRatio = timeSec / QUESTION_TIME_LIMIT;
    const timeScore = timeRatio < 0.2 ? 60 : timeRatio < 0.75 ? 100 : 80;

    const overall = Math.round(keywordScore * 0.5 + lengthScore * 0.3 + timeScore * 0.2);

    let feedback = q.sampleFeedback;
    const missing = q.idealKeywords.filter((k) => !lower.includes(k));
    if (missing.length > 0) {
      feedback += ` Consider touching on: ${missing.slice(0, 4).join(', ')}.`;
    }
    if (text.trim().split(/\s+/).length < 40) {
      feedback += ' Your answer was brief — aim for a fuller response with concrete detail.';
    }

    return { score: Math.max(10, Math.min(100, overall)), feedback };
  };

  const submitAnswer = () => {
    if (!draft.trim()) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const timeSec = Math.round((Date.now() - questionStartRef.current) / 1000);
    const { score, feedback } = scoreAnswer(question, draft, timeSec);

    const updated = [...answers, { question, text: draft, timeTakenSec: timeSec, score, feedback }];
    setAnswers(updated);
    setDraft('');
    setShowHint(false);

    if (currentIdx + 1 < track.questions.length) {
      setCurrentIdx(currentIdx + 1);
      startTimer();
    } else {
      finishInterview(updated);
    }
  };

  const skipQuestion = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const timeSec = Math.round((Date.now() - questionStartRef.current) / 1000);
    const updated = [
      ...answers,
      { question, text: '', timeTakenSec: timeSec, score: 0, feedback: 'Question skipped. Try to answer every question — partial answers still earn credit.' },
    ];
    setAnswers(updated);
    setDraft('');
    setShowHint(false);

    if (currentIdx + 1 < track.questions.length) {
      setCurrentIdx(currentIdx + 1);
      startTimer();
    } else {
      finishInterview(updated);
    }
  };

  const finishInterview = async (allAnswers: Answer[]) => {
    setPhase('submitting');
    if (timerRef.current) clearInterval(timerRef.current);

    const contentScore = Math.round(
      allAnswers.reduce((sum, a) => sum + a.score, 0) / allAnswers.length,
    );
    const deliveryScore = Math.round(
      allAnswers.reduce((sum, a) => {
        const len = a.text.trim().split(/\s+/).length;
        return sum + Math.min(100, (len / 100) * 100);
      }, 0) / allAnswers.length,
    );
    const composureScore = Math.round(
      allAnswers.reduce((sum, a) => {
        const timeRatio = a.timeTakenSec / QUESTION_TIME_LIMIT;
        return sum + (timeRatio < 0.25 ? 70 : timeRatio < 0.8 ? 100 : 75);
      }, 0) / allAnswers.length,
    );
    const overall = Math.round(contentScore * 0.5 + deliveryScore * 0.3 + composureScore * 0.2);

    const { data: sessionRow, error: sessionErr } = await supabase
      .from('interview_sessions')
      .insert({
        role,
        track: trackId,
        status: 'completed',
        overall_score: overall,
        content_score: contentScore,
        delivery_score: deliveryScore,
        composure_score: composureScore,
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (sessionErr || !sessionRow) {
      setError(sessionErr?.message ?? 'Failed to save your session. Please try again.');
      setPhase('active');
      return;
    }

    const rows = allAnswers.map((a, i) => ({
      session_id: sessionRow.id,
      question_text: a.question.text,
      question_order: i + 1,
      answer_text: a.text || null,
      time_taken_sec: a.timeTakenSec,
      score: a.score,
      feedback: a.feedback,
    }));

    const { error: qErr } = await supabase.from('session_questions').insert(rows);

    if (qErr) {
      setError(qErr.message);
      setPhase('active');
      return;
    }

    navigate(`/report/${sessionRow.id}`, { replace: true });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

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

      <main className="relative mx-auto max-w-4xl px-6 py-10">
        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {phase === 'setup' && (
          <SetupPhase
            role={role}
            setRole={setRole}
            trackId={trackId}
            setTrackId={setTrackId}
            begin={beginInterview}
          />
        )}

        {phase === 'active' && (
          <div className="animate-[fadeUp_0.4s_ease-out]">
            {/* Progress + timer */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-300">
                  Question {currentIdx + 1} of {track.questions.length}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 font-mono font-semibold ${
                    timeLeft < 30 ? 'text-red-400' : 'text-slate-300'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-sky-400">
                <Video className="h-4 w-4" />
                {track.label} · {role}
              </div>
              <h2 className="text-xl font-semibold leading-snug text-white sm:text-2xl">
                {question.text}
              </h2>

              <button
                onClick={() => setShowHint((v) => !v)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-amber-300 transition hover:text-amber-200"
              >
                <Lightbulb className="h-4 w-4" />
                {showHint ? 'Hide hint' : 'Show hint'}
              </button>
              {showHint && (
                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
                  {question.hint}
                </div>
              )}

              {/* Mock video feed */}
              <div className="mt-6 flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRecording((v) => !v)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                      recording
                        ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/40'
                        : 'bg-white/5 text-slate-400 ring-1 ring-inset ring-white/10'
                    }`}
                    aria-label={recording ? 'Stop recording' : 'Start recording'}
                  >
                    {recording ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {recording ? 'Recording' : 'Mic off'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {recording ? 'Type your answer below — audio is simulated.' : 'Toggle to simulate a live recording.'}
                    </div>
                  </div>
                </div>
                {recording && (
                  <span className="flex items-center gap-1.5 text-xs text-red-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    LIVE
                  </span>
                )}
              </div>

              {/* Answer area */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-300">Your answer</label>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                  placeholder="Type your response as you would speak it aloud…"
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={skipQuestion}
                  className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                >
                  Skip
                </button>
                <button
                  onClick={submitAnswer}
                  disabled={!draft.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {currentIdx + 1 < track.questions.length ? 'Next question' : 'Finish interview'}
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'submitting' && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-2 border-white/10 border-t-sky-400" />
              <Trophy className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-sky-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-white">Generating your report…</h2>
            <p className="mt-2 text-sm text-slate-400">Analyzing content, delivery and composure scores.</p>
          </div>
        )}
      </main>

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function SetupPhase({
  role,
  setRole,
  trackId,
  setTrackId,
  begin,
}: {
  role: string;
  setRole: (v: string) => void;
  trackId: string;
  setTrackId: (v: string) => void;
  begin: () => void;
}) {
  return (
    <div className="animate-[fadeUp_0.5s_ease-out]">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Set up your mock interview</h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-400">
          Pick your target role and interview track. You will get {tracks[0].questions.length} timed questions with instant scoring.
        </p>
      </div>

      <div className="mt-10 space-y-8">
        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-300">Target role</label>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  role === r
                    ? 'border-sky-400/60 bg-sky-500/15 text-sky-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-300">Interview track</label>
          <div className="grid gap-4 sm:grid-cols-3">
            {tracks.map((t) => (
              <button
                key={t.id}
                onClick={() => setTrackId(t.id)}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  trackId === t.id
                    ? 'border-sky-400/60 bg-sky-500/10 shadow-lg shadow-sky-500/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                }`}
              >
                <div className="text-base font-semibold text-white">{t.label}</div>
                <div className="mt-1 text-xs text-slate-400">{t.description}</div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-sky-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t.questions.length} questions
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={begin}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-3.5 text-base font-semibold text-slate-950 shadow-xl shadow-sky-500/25 transition-all hover:-translate-y-0.5 hover:shadow-sky-500/40"
          >
            Begin interview
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
