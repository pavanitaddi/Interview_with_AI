import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Session = {
  id: string;
  user_id: string;
  role: string;
  track: string;
  status: string;
  overall_score: number | null;
  content_score: number | null;
  delivery_score: number | null;
  composure_score: number | null;
  started_at: string;
  completed_at: string | null;
};

export type SessionQuestion = {
  id: string;
  session_id: string;
  question_text: string;
  question_order: number;
  answer_text: string | null;
  time_taken_sec: number | null;
  score: number | null;
  feedback: string | null;
};
