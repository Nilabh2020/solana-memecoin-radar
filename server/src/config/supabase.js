import { createClient } from '@supabase/supabase-js';
import env from './env.js';

// Admin client with service role key — bypasses RLS
const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

export default supabase;
