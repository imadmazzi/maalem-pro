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
    signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, metadata: any) => Promise<{ error: any }>;
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
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle();

        if (error) {
            console.warn('[Auth] profiles fetch error:', error.message);
        }

        const p = data as SupabaseProfile | null;
        setProfile(p);
        setProfileComplete(!!p?.business_name);

        // Sync essential profile info for PDF generator/UI that still expects it
        if (p) {
            localStorage.setItem('businessProfile', JSON.stringify({
                name: p.business_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Maalem',
                email: p.email || u.email || '',
                phone: p.phone || '',
                address: p.address || '',
                category: p.category || 'General',
                avatar: p.avatar_url || u.user_metadata?.avatar_url || '',
            }));
        }
    }, []);

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

        const initAuth = async () => {
            const { data: { session: s } } = await supabase.auth.getSession();
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) {
                await loadProfile(s.user);
            }
            setIsLoading(false);
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event: string, s: Session | null) => {
                setSession(s);
                setUser(s?.user ?? null);
                if (s?.user) {
                    await loadProfile(s.user);
                } else {
                    setProfile(null);
                    setProfileComplete(false);
                    localStorage.removeItem('businessProfile');
                }
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [loadProfile]);

    // ── Email/Password Sign In ──────────────────────────────────────────────
    const signInWithEmail = async (email: string, password: string) => {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        return await supabase.auth.signInWithPassword({ email, password });
    };

    // ── Email/Password Sign Up ──────────────────────────────────────────────
    const signUp = async (email: string, password: string, metadata: any) => {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        return await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });
    };

    // ── Google OAuth ─────────────────────────────────────────────────────────
    const signInWithGoogle = async () => {
        if (!isSupabaseConfigured || !supabase) return;
        const getSafeOrigin = () => window.location.origin.replace('//0.0.0.0', '//localhost');
        const redirectTo = `${getSafeOrigin()}/auth/callback`;
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' } },
        });
    };

    // ── Sign Out ─────────────────────────────────────────────────────────────
    const signOut = async () => {
        if (supabase) await supabase.auth.signOut();
        localStorage.removeItem('businessProfile');
        setUser(null);
        setSession(null);
        setProfile(null);
        setProfileComplete(false);
        router.replace('/login');
    };

    return (
        <AuthContext.Provider value={{
            user, session, profile, profileComplete,
            isLoading, signInWithGoogle, signInWithEmail, signUp, signOut, refreshProfile,
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
