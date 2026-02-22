'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
export interface SupabaseProfile {
    id: string;
    business_name: string | null;
    phone: string | null;
    address: string | null;
    email: string | null;
    avatar_url: string | null;
    category: string | null;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: SupabaseProfile | null;
    profileComplete: boolean;          // true when business_name is filled
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>; // call after completing profile form
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<SupabaseProfile | null>(null);
    const [profileComplete, setProfileComplete] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    // ── Load profile from Supabase for a given user ─────────────────────────
    const loadProfile = useCallback(async (u: User) => {
        if (!supabase) return;
        console.log('[Auth] Fetching profile for user:', u.id);
        const { data, error, status } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle();

        if (error) {
            console.warn('[Auth] profiles fetch error:', error.message, '| status:', status);
        }

        const p = data as SupabaseProfile | null;
        console.log('[Auth] Profile loaded:', p ? `✅ Found (${p.business_name})` : '⚪ No profile found');

        setProfile(p);
        setProfileComplete(!!p?.business_name);

        // Sync to localStorage.businessProfile so existing pages work
        syncToLocalStorage(u, p);
    }, []);

    // ── Sync Supabase user + profile → localStorage businessProfile ──────────
    const syncToLocalStorage = (u: User, p: SupabaseProfile | null) => {
        const existing = localStorage.getItem('businessProfile');
        const local = existing ? JSON.parse(existing) : {};

        const updated = {
            name: p?.business_name || local.name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Maalem',
            email: p?.email || local.email || u.email || '',
            phone: p?.phone || local.phone || u.user_metadata?.phone || '',
            address: p?.address || local.address || '',
            category: p?.category || local.category || 'General',
            avatar: p?.avatar_url || u.user_metadata?.avatar_url || local.avatar || '',
        };

        localStorage.setItem('businessProfile', JSON.stringify(updated));
        localStorage.setItem('isAuthenticated', 'true');
    };

    // ── refreshProfile — call after the complete-profile form saves ──────────
    const refreshProfile = useCallback(async () => {
        if (user) await loadProfile(user);
    }, [user, loadProfile]);

    // ── Bootstrap: load session + profile on mount ───────────────────────────
    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) {
            setIsLoading(false);
            return;
        }

        supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
            const s = data.session;
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) {
                loadProfile(s.user).then(() => setIsLoading(false));
            } else {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: string, s: Session | null) => {
                setSession(s);
                setUser(s?.user ?? null);
                if (s?.user) {
                    loadProfile(s.user);
                    localStorage.setItem('isAuthenticated', 'true');
                } else {
                    setProfile(null);
                    setProfileComplete(false);
                    localStorage.removeItem('isAuthenticated');
                }
            }
        );

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Google OAuth ─────────────────────────────────────────────────────────
    const signInWithGoogle = async () => {
        if (!isSupabaseConfigured || !supabase) {
            console.error('[Auth] Supabase not configured');
            return;
        }

        /** Normalize 0.0.0.0 → localhost so OAuth redirect works in dev */
        const getSafeOrigin = () =>
            window.location.origin.replace('//0.0.0.0', '//localhost');

        const redirectTo = `${getSafeOrigin()}/dashboard`;
        console.log('[Auth] OAuth redirectTo:', redirectTo);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        });
        if (error) console.error('[Auth] Google sign-in error:', error);
    };

    // ── Sign Out ─────────────────────────────────────────────────────────────
    const signOut = async () => {
        if (supabase) await supabase.auth.signOut();
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('businessProfile'); // Clear local cache on logout
        setUser(null);
        setSession(null);
        setProfile(null);
        setProfileComplete(false);
        // Using window.location.href for a hard redirect to clear all states/cache
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user, session, profile, profileComplete,
            isLoading, signInWithGoogle, signOut, refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
