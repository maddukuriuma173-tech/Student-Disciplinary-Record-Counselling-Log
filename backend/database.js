import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to this file's directory (backend/.env)
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://wtqgklsdayecjyezsfom.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cWdrbHNkYXllY2p5ZXpzZm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NzMxODIsImV4cCI6MjA5NzI0OTE4Mn0.MAX-C2rmT1GvzwenxMAuqvY9P6gERRQ3x4U4NLoxoeg';

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase URL or Anon Key is missing in environment variables.');
}

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (supabase) {
  console.log('Supabase Client initialized for project URL:', supabaseUrl);
} else {
  console.warn('Supabase Client NOT initialized (missing credentials).');
}

export default supabase;
