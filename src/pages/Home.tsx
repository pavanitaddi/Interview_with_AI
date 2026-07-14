import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Eye,
  Mic,
  Play,
  Sparkles,
  Star,
  Video,
  Zap,
} from 'lucide-react';

type NavItem = { label: string; href: string; id: string };

const navItems: NavItem[] = [
  { label: 'Features', href: '#features', id: 'features' },
  { label: 'Pricing', href: '#pricing', id: 'pricing' },
  { label: 'How it works', href: '#how', id: 'how' },
];

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/forever',
    description: 'Get a feel for the platform with mock interviews.',
    features: ['3 mock interviews / month', 'Basic feedback report', 'Email support'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Everything you need to land your next role.',
    features: [
      'Unlimited mock interviews',
      'AI-driven behavioral & technical tracks',
      'Detailed performance analytics',
      'Priority support',
    ],
    cta: 'Start Interview',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$99',
    period: '/month',
    description: 'For cohorts, bootcamps and hiring teams.',
    features: ['Everything in Pro', 'Up to 10 seats', 'Team analytics dashboard', 'Custom rubrics'],
    cta: 'Get Started',
    highlight: false,
  },
];

const features = [
  {
    icon: Video,
    title: 'Realistic video interviews',
    description:
      'Practice with a live interviewer avatar that reacts to your answers, pacing and body language in real time.',
  },
  {
    icon: Mic,
    title: 'Speech & tone analysis',
    description:
      'Our engine scores filler words, pace, confidence and clarity so you sound polished under pressure.',
  },
  {
    icon: Cpu,
    title: 'Adaptive question engine',
    description:
      'Questions adapt to your role and seniority, drilling deeper on weak areas until you are bulletproof.',
  },
  {
    icon: BarChart3,
    title: 'Detailed performance reports',
    description:
      'Every session produces a breakdown of strengths, gaps and a personalized plan for the next round.',
  },
  {
    icon: Eye,
    title: 'Eye-contact & presence scoring',
    description:
      'Computer vision measures eye contact and composure, the signals interviewers judge but never mention.',
  },
  {
    icon: Zap,
    title: 'Instant replays',
    description:
      'Re-watch any answer with synced transcripts and timestamps to sharpen your delivery in minutes.',
  },
];

const stats = [
  { value: '50k+', label: 'Mock interviews run' },
  { value: '4.9/5', label: 'Average user rating' },
  { value: '92%', label: 'Felt more confident' },
  { value: '12 min', label: 'To first feedback' },
];

const testimonials = [
  {
    quote:
      'I went from freezing in interviews to three onsite offers in a month. The feedback is scary accurate.',
    name: 'Aisha N.',
    role: 'Software Engineer at Stripe',
  },
  {
    quote:
      'The eye-contact scoring alone fixed something I never knew I was doing wrong. Worth every cent.',
    name: 'Marcus L.',
    role: 'PM at Notion',
  },
  {
    quote:
      'We use the Team plan for our bootcamp cohort. Placement rate jumped from 71% to 88% in one cycle.',
    name: 'Priya R.',
    role: 'Lead Instructor, CodePath',
  },
];

function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const handler = () => {
      const offset = window.innerHeight * 0.35;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) current = id;
      }
      setActive(current);
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [ids]);
  return active;
}

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useScrollSpy(['features', 'pricing', 'how']);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* Navbar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-950/85 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950 shadow-lg shadow-sky-500/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Intervu</span>
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className={`text-sm font-medium transition-colors hover:text-sky-300 ${
                    activeSection === item.id ? 'text-sky-300' : 'text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:shadow-sky-500/40 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-sky-500/20 blur-[120px]" />
          <div className="absolute top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 animate-[fadeDown_0.6s_ease-out]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            New: adaptive behavioral tracks are live
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl animate-[fadeUp_0.7s_ease-out]">
            Ace every interview with
            <span className="block bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              AI-powered practice
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 animate-[fadeUp_0.8s_ease-out]">
            Run realistic mock interviews, get instant feedback on delivery and content, and walk into
            your next onsite calm, sharp and ready.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-[fadeUp_0.9s_ease-out]">
            <button
              onClick={() => navigate('/interview', { state: { from: '/interview' } })}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-7 py-3.5 text-base font-semibold text-slate-950 shadow-xl shadow-sky-500/25 transition-all hover:shadow-sky-500/40 hover:-translate-y-0.5"
            >
              Start Interview
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-slate-100 transition-all hover:bg-white/10 hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4" />
              Learn More
            </button>
          </div>

          <div className="mx-auto mt-16 max-w-5xl animate-[fadeUp_1s_ease-out]">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-center transition-colors hover:border-white/10"
                >
                  <div className="text-3xl font-bold text-white">{s.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="Features"
            title="Everything you need to rehearse like a pro"
            subtitle="From the first hello to the final round, Intervu covers the full loop so nothing surprises you on game day."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="How it works"
            title="From cold start to confident in three steps"
            subtitle="No setup, no scheduling. You can be mid-interview in under a minute."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { n: '01', title: 'Pick your track', body: 'Choose a role and interview type — behavioral, system design, or domain-specific.' },
              { n: '02', title: 'Run the mock', body: 'Answer live questions with video and audio captured for instant analysis.' },
              { n: '03', title: 'Read your report', body: 'Get a breakdown of content, delivery and composure plus a focused practice plan.' },
            ].map((step) => (
              <div
                key={step.n}
                className="relative rounded-2xl border border-white/5 bg-white/[0.03] p-8 transition-colors hover:border-white/10"
              >
                <div className="text-sm font-semibold text-sky-400">{step.n}</div>
                <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="Loved by candidates"
            title="Results that speak for themselves"
            subtitle="Thousands of candidates sharpened their delivery with Intervu before the offer."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-8 transition-colors hover:border-white/10"
              >
                <div className="mb-4 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-slate-200">"{t.quote}"</blockquote>
                <figcaption className="mt-6 border-t border-white/5 pt-4">
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple plans that scale with you"
            subtitle="Start free. Upgrade when you are ready to go all in."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all hover:-translate-y-1 ${
                  p.highlight
                    ? 'border-sky-400/40 bg-gradient-to-b from-sky-500/10 to-transparent shadow-2xl shadow-sky-500/10'
                    : 'border-white/5 bg-white/[0.03] hover:border-white/10'
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{p.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{p.price}</span>
                  <span className="text-sm text-slate-400">{p.period}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to={p.cta === 'Start Interview' ? '/interview' : '/register'}
                  className={`mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                    p.highlight
                      ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 shadow-lg shadow-sky-500/25'
                      : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/15 via-slate-900 to-emerald-500/10 p-12 text-center">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-500/30 blur-[100px]" />
            <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to walk in confident?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
              Run your first mock interview today and get a full performance report in minutes.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate('/interview', { state: { from: '/interview' } })}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-7 py-3.5 text-base font-semibold text-slate-950 shadow-xl shadow-sky-500/25 transition-all hover:shadow-sky-500/40 hover:-translate-y-0.5"
              >
                Start Interview
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => scrollTo('pricing')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-slate-100 transition-all hover:bg-white/10 hover:-translate-y-0.5"
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">Intervu</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Intervu. Built for confident candidates.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeScale {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-sky-400">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base text-slate-400">{subtitle}</p>
    </div>
  );
}

type FeatureCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`group rounded-2xl border border-white/5 bg-white/[0.03] p-7 transition-all duration-700 hover:-translate-y-1 hover:border-sky-400/30 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 text-sky-300 ring-1 ring-inset ring-white/10 transition-transform group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
