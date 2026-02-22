import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ── Boot-time diagnostic (visible in browser console) ──────────────
if (typeof window !== 'undefined') {
  const urlOk = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
  const keyOk = supabaseAnonKey.length > 20;
  const keyJwt = supabaseAnonKey.startsWith('eyJ');
  const keySbp = supabaseAnonKey.startsWith('sb_publishable_');

  console.group('🔐 Supabase Init Diagnostic');
  console.log('URL :', supabaseUrl
    ? supabaseUrl.replace(/\/\/(.{6}).*\.supabase/, '//$1******.supabase')
    : '❌ MISSING');
  console.log('KEY format :',
    keyJwt ? '✅ JWT (eyJ...)' :
      keySbp ? '⚠️  sb_publishable_ (new format — may not work with PostgREST)' :
        keyOk ? '⚠️  Unknown format' :
          '❌ MISSING or too short');
  console.log('isConfigured :', urlOk && keyOk);

  if (keySbp) {
    console.warn(
      '⚠️  Your key starts with "sb_publishable_". ' +
      'Supabase PostgREST requires a JWT key that starts with "eyJ". ' +
      'Go to: Supabase Dashboard → Settings → API → anon/public key (copy the long eyJ... value).'
    );
  }
  console.groupEnd();
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'public' },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
  })
  : (null as any);

/** Raw HTTP ping — bypasses supabase-js entirely to test the actual API key */
export async function pingSupabase(): Promise<{ ok: boolean; status: number; body: string }> {
  if (!isSupabaseConfigured) return { ok: false, status: 0, body: 'Not configured' };
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/clients?select=id&limit=1`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    const body = await res.text();
    console.log(`[pingSupabase] HTTP ${res.status} ${res.statusText} — body: ${body.slice(0, 200)}`);
    return { ok: res.ok, status: res.status, body };
  } catch (e: any) {
    console.error('[pingSupabase] Network error:', e?.message);
    return { ok: false, status: 0, body: e?.message || 'Network error' };
  }
}