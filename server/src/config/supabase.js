import { createClient } from '@supabase/supabase-js';
import env from './env.js';

let supabase = null;

if (env.supabaseUrl && env.supabaseServiceRoleKey) {
  supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
} else {
  console.warn('[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — auth/payments disabled');
}

export default supabase;
