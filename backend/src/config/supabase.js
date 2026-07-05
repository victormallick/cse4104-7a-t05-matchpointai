const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const forceDemoMode = String(process.env.DEMO_MODE).toLowerCase() === 'true';

const isSupabaseConfigured = Boolean(
  !forceDemoMode &&
  supabaseUrl &&
  supabaseAnonKey &&
  /^https:\/\/.+\.supabase\.co$/i.test(supabaseUrl)
);

if (!isSupabaseConfigured) {
  console.warn('Supabase is not configured. MatchPoint AI is running in local demo mode.');
}

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

module.exports = {
  supabase,
  isSupabaseConfigured
};
