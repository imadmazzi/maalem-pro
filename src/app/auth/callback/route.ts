import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /auth/callback
 *
 * Supabase redirects here after Google OAuth with a `code` param.
 * Steps:
 *  1. Exchange code → session (PKCE flow)
 *  2. Check if the user has a completed profile in `profiles` table
 *  3. Redirect to /complete-profile if not, or /dashboard if yes
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=no_code`);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('[auth/callback] Supabase env vars missing');
        return NextResponse.redirect(`${origin}/dashboard`);
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // ── 1. Exchange the OAuth code for a user session ─────
        const { data: { session }, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeErr || !session) {
            console.error('[auth/callback] exchangeCodeForSession error:', exchangeErr);
            return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
        }

        const userId = session.user.id;

        // ── 2. Check if the user already has a complete profile ─
        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('business_name, phone, address')
            .eq('id', userId)
            .maybeSingle();

        if (profileErr) {
            // Table might not exist yet — fall through to dashboard
            console.warn('[auth/callback] profiles query error:', profileErr.message);
            return NextResponse.redirect(`${origin}/dashboard`);
        }

        // Profile is "complete" when business_name is filled in
        const isComplete = !!profile?.business_name;

        console.log(`[auth/callback] user ${userId} — profile complete: ${isComplete}`);

        return NextResponse.redirect(
            isComplete ? `${origin}/dashboard` : `${origin}/complete-profile`
        );

    } catch (e) {
        console.error('[auth/callback] unexpected error:', e);
        return NextResponse.redirect(`${origin}/dashboard`);
    }
}
