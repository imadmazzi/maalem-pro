import { NextResponse } from 'next/server';

/**
 * GET /api/supabase-test
 *
 * Server-side diagnostic: reads env vars, pings Supabase REST API,
 * and attempts to INSERT a test client row — all from Node.js (not browser).
 * This eliminates any CORS / browser env-variable issues.
 */
export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const result: Record<string, any> = {
        env: {
            url_length: url.length,
            url_preview: url ? url.replace(/\/\/(.{6}).*\.supabase/, '//$1******.supabase') : 'MISSING',
            key_length: key.length,
            key_format: key.startsWith('eyJ') ? 'JWT (good)' :
                key.startsWith('sb_publishable_') ? 'sb_publishable_ (may be read-only!)' :
                    key ? 'unknown format' : 'MISSING',
        },
        ping: null,
        insert: null,
    };

    if (!url || !key) {
        return NextResponse.json({ ...result, error: 'Env vars missing — check .env.local and restart server' }, { status: 500 });
    }

    // ── 1. Ping (SELECT) ────────────────────────────────────
    try {
        const pingRes = await fetch(`${url}/rest/v1/clients?select=id&limit=1`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
        });
        const pingBody = await pingRes.text();
        result.ping = { status: pingRes.status, ok: pingRes.ok, body: pingBody.slice(0, 300) };
    } catch (e: any) {
        result.ping = { error: e?.message };
    }

    // ── 2. Insert hardcoded test client ─────────────────────
    const testPayload = {
        id: '00000000-0000-0000-0000-000000000001',
        user_id: 'server-diagnostic-test',
        name: 'Test Client (diagnostic)',
        phone: '0600000000',
        email: 'test@diagnostic.local',
        address: 'Diagnostic Address',
        ice: null,
    };

    try {
        const insertRes = await fetch(`${url}/rest/v1/clients`, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=representation',
            },
            body: JSON.stringify(testPayload),
        });
        const insertBody = await insertRes.text();
        result.insert = {
            status: insertRes.status,
            statusText: insertRes.statusText,
            ok: insertRes.ok,
            body: insertBody.slice(0, 500),
            diagnosis: insertRes.ok ? 'SUCCESS — Supabase insert works!' :
                insertBody.includes('row-level security') ? 'RLS IS BLOCKING — disable RLS on clients table' :
                    insertBody.includes('uuid') ? 'UUID TYPE MISMATCH — change id column to text, or use real UUIDs' :
                        insertBody.includes('Invalid API key') ? 'INVALID API KEY — get eyJ... key from Supabase Dashboard' :
                            insertBody.includes('does not exist') ? 'TABLE NOT FOUND — check table name is exactly "clients"' :
                                'Unknown error — see body above',
        };
    } catch (e: any) {
        result.insert = { error: e?.message };
    }

    return NextResponse.json(result, { status: 200 });
}
